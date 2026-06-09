from fastapi import FastAPI
from fastapi.templating import Jinja2Templates

from pathlib import Path

app = FastAPI()
templates = Jinja2Templates(directory=Path(__file__).parent / "templates")

import uvicorn

def run():
    uvicorn.run("quartzwood.api.routes:app", host="127.0.0.1", port=8000, reload=True)