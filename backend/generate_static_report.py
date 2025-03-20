import aiohttp
import asyncio
import json
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv('PERPLEXITY_API_KEY')
if not API_KEY:
    raise ValueError("PERPLEXITY_API_KEY not found in .env file")

async def generate_report():
    async with aiohttp.ClientSession() as session:
        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }
        
        query = """Create a Northern Ireland focused energy market report including:
1. ISEM Day Ahead market forecast and location-specific insights  within the last 1 month
2. Short-term UK/NI energy sector trends (wind, gas, fuel prices) within the last 1 month
3. Long-term Northern Irish and UK market outlook

Format the response exactly as follows:

Subject: [Key NI/UK market findings - one line]

Executive Summary:
[2-3 sentences summarizing the most important Northern Irish and UK market developments within the last 1 month]

Short-Term Analysis:
• ISEM Day Ahead Forecast: [Specific price predictions and location insights within the last 1 month]
• Current Market Drivers: [Immediate factors affecting NI/UK energy prices  within the last 1 month]
• Recent Trends: [Latest movements in wind, gas, and fuel prices  within the last 1 month] 

Long-Term Analysis:
• Northern Ireland Outlook: [Infrastructure and policy developments]
• UK Energy Market: [Broader market trends affecting NI]
• Strategic Implications: [Long-term trading and investment considerations]

Sources:
[List all sources used in numbered format, e.g.:]
[1] Source name with specific details
[2] Another source with details
etc."""
        
        payload = {
            "model": "sonar-deep-research",
            "messages": [{"role": "user", "content": query}],
            "temperature": 0.7
        }
        
        async with session.post(
            "https://api.perplexity.ai/chat/completions",
            headers=headers,
            json=payload
        ) as response:
            if response.status != 200:
                raise Exception(f"API Error: {await response.text()}")
            
            data = await response.json()
            
            if not data.get('choices'):
                raise Exception("No content in API response")
            
            content = data['choices'][0]['message']['content']
            
            # Parse response into sections
            sections = {
                "subject": "",
                "executive_summary": "",
                "short_term_analysis": "",
                "long_term_analysis": "",
                "sources": ""
            }
            
            current_section = None
            source_lines = []
            
            for line in content.split('\n'):
                line = line.strip()
                if not line:
                    continue
                    
                if "Subject:" in line:
                    sections["subject"] = line.replace("Subject:", "").strip()
                elif "Executive Summary:" in line:
                    current_section = "executive_summary"
                elif "Short-Term Analysis:" in line:
                    current_section = "short_term_analysis"
                elif "Long-Term Analysis:" in line:
                    current_section = "long_term_analysis"
                elif "Sources:" in line:
                    current_section = "sources"
                elif current_section == "sources" and line:
                    # Collect source lines
                    if line.startswith('[') and ']' in line:
                        source_lines.append(line)
                elif current_section and current_section != "sources" and line:
                    sections[current_section] += line + "\n"
            
            # Format and add sources
            if source_lines:
                sections["sources"] = "\n".join(source_lines)
            else:
                # Fallback if no sources found in response
                sections["sources"] = "[1] API Response (No specific sources provided)"
            
            # Clean up sections
            for key in sections:
                if key != "sources":  # Don't strip sources as we want to preserve formatting
                    sections[key] = sections[key].strip()
            
            # Add generation timestamp
            sections["generated_at"] = datetime.now().isoformat()
            
            # Save to backend directory
            os.makedirs("reports", exist_ok=True)
            with open("reports/latest.json", "w") as f:
                json.dump(sections, f, indent=2)
            
            # Save directly to frontend public directory
            os.makedirs("../frontend/public", exist_ok=True)
            with open("../frontend/public/report.json", "w") as f:
                json.dump(sections, f, indent=2)
            
            print("Report generated and saved to:")
            print("- backend/reports/latest.json")
            print("- frontend/public/report.json")
            print("\nReport content:")
            print(json.dumps(sections, indent=2))

if __name__ == "__main__":
    asyncio.run(generate_report())