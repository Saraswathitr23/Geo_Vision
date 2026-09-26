# Backend setup note

1. Create and activate a virtual environment.
2. Install dependencies with `pip install -r requirements.txt`.
3. Copy `.env.example` to `.env`.
4. Set a strong random value for `JWT_SECRET_KEY`.
5. Run `python app.py`.

Never commit `.env` or generated cache/database/report files.
