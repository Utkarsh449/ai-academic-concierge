import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const server = new Server({
    name: "calendar-mcp-server",
    version: "1.0.0"
}, {
    capabilities: {
        tools: {}
    }
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get_schedule",
                description: "Accepts a number of days (default 7) and returns a list of mock busy time slots.",
                inputSchema: {
                    type: "object",
                    properties: {
                        days: {
                            type: "number",
                            description: "Number of days to look ahead",
                            default: 7
                        }
                    }
                }
            },
            {
                name: "schedule_study_block",
                description: "Accepts a title, start_time, and duration_minutes, returning a confirmation message that the block has been written to the calendar.",
                inputSchema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        start_time: { type: "string" },
                        duration_minutes: { type: "number" }
                    },
                    required: ["title", "start_time", "duration_minutes"]
                }
            }
        ]
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "get_schedule") {
        const days = request.params.arguments?.days || 7;
        const busySlots = [
            { date: "Tomorrow", start: "10:00 AM", end: "12:00 PM", event: "Classes" },
            { date: "Next Week", start: "2:00 PM", end: "4:00 PM", event: "Study Group" }
        ];
        return {
            content: [{
                type: "text",
                text: `Mock busy time slots for the next ${days} days:\n${JSON.stringify(busySlots, null, 2)}`
            }]
        };
    } else if (request.params.name === "schedule_study_block") {
        const { title, start_time, duration_minutes } = request.params.arguments;
        return {
            content: [{
                type: "text",
                text: `Confirmation: Successfully scheduled '${title}' at ${start_time} for ${duration_minutes} minutes.`
            }]
        };
    } else {
        throw new Error(`Tool not found: ${request.params.name}`);
    }
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Calendar MCP Server running on stdio");
}

main().catch(console.error);
