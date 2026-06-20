import asyncio
import os
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from google.adk.agents import Agent
from google.adk.runners import InMemoryRunner
from google.genai import types
from google.adk.tools.mcp_tool import McpToolset, StdioConnectionParams
from mcp import StdioServerParameters

from skills.problem_generator import fetch_daily_challenge

# Configure the local MCP server using stdio subprocess communication
calendar_mcp_toolset = McpToolset(
    connection_params=StdioConnectionParams(
        timeout=15.0,  # Slight initialization delay/timeout for Windows
        server_params=StdioServerParameters(
            command="node",
            args=[os.path.abspath(os.path.join(os.path.dirname(__file__), "mcp_servers", "server.js"))],
            env={**os.environ} 
        )
    )
)

# Define the academic and career concierge agent
concierge_agent = Agent(
    name="concierge_agent",
    instruction=(
        "You are an elite academic and career concierge. "
        "Your goal is to help manage study schedules, track exam deadlines (like SSC and GATE), "
        "and provide daily competitive programming challenges focusing on Python, "
        "sorting algorithms, and hard-level string matching."
    ),
    tools=[fetch_daily_challenge, calendar_mcp_toolset]
)

runner = InMemoryRunner(agent=concierge_agent)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Explicitly create the session in memory before starting the app
    await runner.session_service.create_session(
        app_name=runner.app_name,
        user_id="default_user",
        session_id="default_session"
    )
    yield
    # Clean up (if any)
    pass

app = FastAPI(title="Academic Concierge API", lifespan=lifespan)

# Allow CORS for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    user_content = types.Content(
        role="user",
        parts=[types.Part.from_text(text=req.message)]
    )
    
    async def event_generator():
        try:
            async for event in runner.run_async(
                user_id="default_user",
                session_id="default_session",
                new_message=user_content
            ):
                # Using SSE format for StreamingResponse
                if getattr(event, 'partial', False):
                    continue
                
                if getattr(event, 'content', None) and getattr(event.content, 'parts', None):
                    for part in event.content.parts:
                        if getattr(part, 'text', None):
                            # Yield chunk data as standard Server-Sent Event
                            chunk_data = json.dumps({"text": part.text})
                            yield f"data: {chunk_data}\n\n"
        except Exception as e:
            error_data = json.dumps({"error": str(e)})
            yield f"data: {error_data}\n\n"
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("concierge_agent:app", host="0.0.0.0", port=8000, reload=True)

