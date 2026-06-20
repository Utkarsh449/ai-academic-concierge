import requests
from bs4 import BeautifulSoup
import logging

logger = logging.getLogger(__name__)

def fetch_daily_challenge(topic: str, difficulty: str = 'Hard') -> str:
    """
    Fetches a competitive programming problem based on the requested topic and difficulty.
    
    This tool attempts to scrape a live programming problem from a competitive programming site. 
    If the live scrape fails (e.g., due to anti-bot protections or network issues), 
    it falls back to a robust, pre-curated problem statement suitable for the topic.

    Args:
        topic (str): The specific computer science topic or algorithm category 
            (e.g., 'string matching', 'sorting algorithms', 'dynamic programming').
        difficulty (str): The desired difficulty level of the problem. Defaults to 'Hard'.

    Returns:
        str: A formatted string containing the problem title, description, 
        sample inputs and outputs, and the optimal time/space complexity approach.
    """
    # Example URL; most real CP sites block simple requests, hence the fallback mechanism
    url = "https://example-competitive-programming-site.com/problems/random"
    params = {'topic': topic, 'difficulty': difficulty}
    
    try:
        # Attempt to fetch a live problem. Timeout set to 5 seconds.
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        response = requests.get(url, params=params, headers=headers, timeout=5)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Simulate finding the problem description from the DOM
        problem_title = soup.find('h1', class_='title').text.strip()
        problem_desc = soup.find('div', class_='description').text.strip()
        
        return f"**Live Problem**: {problem_title}\n\n{problem_desc}"
        
    except Exception as e:
        logger.warning(f"Live scrape failed due to {type(e).__name__}. Falling back to curated problem.")
        
        # Fallback mechanism: return a challenging, pre-curated Python problem statement.
        if "string matching" in topic.lower() or "string" in topic.lower():
            return (
                f"**Fallback Curated Problem**: {difficulty} Level - Advanced String Subsequence Matching\n\n"
                "**Problem Statement**:\n"
                "Given a string `s` and an array of strings `words`, return the number of `words[i]` "
                "that are a subsequence of `s`. A subsequence of a string is a new string generated "
                "from the original string with some characters (can be none) deleted without "
                "changing the relative order of the remaining characters.\n\n"
                "**Sample Input**:\n"
                "s = \"abcde\", words = [\"a\",\"bb\",\"acd\",\"ace\"]\n\n"
                "**Sample Output**:\n"
                "3\n\n"
                "**Optimal Approach**:\n"
                "- **Time Complexity**: O(S + W * L) where S is the length of `s`, W is the number of words, "
                "and L is the average length of each word.\n"
                "- **Space Complexity**: O(26) or O(W) depending on the mapping approach used.\n"
                "- **Hint**: Use a dictionary/hash map to track the next character needed for each word "
                "(the 'next letter pointer' approach)."
            )
        elif "sort" in topic.lower():
            return (
                f"**Fallback Curated Problem**: {difficulty} Level - Overlapping Interval Sorting\n\n"
                "**Problem Statement**:\n"
                "Given an array of intervals where `intervals[i] = [start_i, end_i]`, merge all "
                "overlapping intervals, and return an array of the non-overlapping intervals that "
                "cover all the intervals in the input.\n\n"
                "**Sample Input**:\n"
                "intervals = [[1,3],[2,6],[8,10],[15,18]]\n\n"
                "**Sample Output**:\n"
                "[[1,6],[8,10],[15,18]]\n\n"
                "**Optimal Approach**:\n"
                "- **Time Complexity**: O(N log N) where N is the number of intervals.\n"
                "- **Space Complexity**: O(log N) or O(N) for the sorting algorithm and the output list.\n"
                "- **Hint**: Sort the intervals by their start time. Then iterate through the list, "
                "merging if the current start time is less than or equal to the previous end time."
            )
        else:
            return (
                f"**Fallback Curated Problem**: {difficulty} Level - {topic.title()} Optimization Challenge\n\n"
                "**Problem Statement**:\n"
                f"Implement a highly optimized solution for a common {topic} scenario. Given a large dataset, "
                "find the most efficient way to process it while minimizing overhead.\n\n"
                "**Sample Input**:\n"
                "A large array or complex data structure relevant to the topic.\n\n"
                "**Sample Output**:\n"
                "The processed result in the optimal format.\n\n"
                "**Optimal Approach**:\n"
                "- Focus on reducing time complexity from O(N^2) to O(N log N) or O(N).\n"
                "- Use advanced data structures (like heaps, segment trees, or tries) if applicable."
            )
