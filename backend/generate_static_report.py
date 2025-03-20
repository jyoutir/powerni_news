from fastapi import FastAPI
import json
from datetime import datetime
import os

app = FastAPI()

def convert_txt_to_json():
    try:
        # Read the text file
        with open('reports/latest.txt', 'r') as f:
            content = f.read()

        # Split the content into sections
        sections = content.split('\n\n')
        
        # Extract subject (first line)
        subject = sections[0].strip()
        
        # Extract main content (everything between subject and sources)
        main_content = '\n\n'.join(sections[1:-2])  # Exclude subject and sources
        
        # Extract sources (last section)
        sources = sections[-1].strip()
        
        # Create JSON structure
        report_json = {
            "subject": subject,
            "content": main_content,
            "sources": sources,
            "generated_at": datetime.now().isoformat()
        }
        
        # Save to both backend and frontend locations
        with open('frontend/public/report.json', 'w') as f:
            json.dump(report_json, f, indent=2)
            
        with open('../frontend/public/report.json', 'w') as f:
            json.dump(report_json, f, indent=2)
            
        print("JSON report generated successfully")
        
    except Exception as e:
        print(f"Error generating JSON report: {e}")

# Convert on startup
convert_txt_to_json()