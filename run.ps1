Start-Process -NoNewWindow -FilePath "powershell.exe" -ArgumentList "-Command `"cd frontend; npm run dev`""
Start-Process -NoNewWindow -FilePath "powershell.exe" -ArgumentList "-Command `"cd backend; ..\venv\Scripts\activate; uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload`""
