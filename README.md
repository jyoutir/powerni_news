# PowerNI Market Insights Dashboard

A real-time email report creation tool that gives recent analysis of Northern Ireland and UK energy markets, including ISEM Day Ahead forecasts and market trends.

## Features

- Live market analysis and forecasting
- ISEM Day Ahead price predictions
- Short-term and long-term market insights
- Newsletter subscription system
- Automatic report generation
- Beautiful, responsive design

## Guide

### 1. First-Time Setup

#### Requirements
- Python 3.9 or higher
- Node.js 18 LTS or higher
- Perplexity API key (required for report generation)



#### Backend Setup
1. Create a file named `.env` in the `backend` folder
2. Add your Perplexity API key:
```
PERPLEXITY_API_KEY=your-api-key-here
```
3. Install backend requirements:
```bash
cd backend
pip3 install -r requirements.txt
cd ..
```

#### Frontend Setup
1. Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

### 3. Running the webpage

You'll need two terminal windows open:

#### Terminal 1 - Frontend
```bash
cd frontend
npm run dev
```
The webpage will be available at: http://localhost:3000

#### Terminal 2 - Backend - generating the Report
```bash
cd backend
python3 generate_static_report.py
```

### 4. Using the webpage

#### What You'll See
1. Title and timestamp
2. Executive summary of market developments
3. Short-term analysis with ISEM Day Ahead forecasts
4. Long-term analysis of NI/UK energy markets
5. Newsletter signup section
6. Source references

#### making new reports
1. To generate a fresh market report:
   ```bash
   cd backend
   python3 generate_static_report.py
   ```
2. You should see confirmation messages about the report being saved
3. The webpage will automatically refresh with new data

### Troubleshooting

#### Common Issues:

1. **"Command not found: python3"**
   - Try using `python` instead of `python3`
   - Make sure Python is installed and added to PATH

2. **"Command not found: npm"**
   - Make sure Node.js is installed
   - Try restarting your terminal

3. **"Error: Cannot find module..."**
   - Make sure you've run `npm install` in the frontend folder

4. **"ModuleNotFoundError: No module named..."**
   - Make sure you've run `pip3 install -r requirements.txt` in the backend folder

5. **"Error: PERPLEXITY_API_KEY not found"**
   - Check that you've created the `.env` file in the backend folder
   - Verify your API key is correctly formatted

For any other issues, please contact support.

## Newsletter Subscription

The webpage includes a newsletter subscription feature that:
- Collects email addresses
- Stores them locally
- Shows a list of subscribed emails
- Validates email format
- Prevents duplicate subscriptions

## Technical Details

For developers and technical users:

- Frontend: Next.js with TypeScript
- Styling: Tailwind CSS
- Backend: Python with aiohttp
- API: Perplexity AI for market analysis
- Storage: Local JSON files and localStorage

if you wanted to deploy this within PowerNI, you would simply migrate all local hosting to cloudservices, like AWS/microsoft azure
and internally generate the emails weekly. 

This is also a prototype, there is much room for improvement, namely in the prompt generation, parsing and format handling - but this would require signifiganly more time investemed 