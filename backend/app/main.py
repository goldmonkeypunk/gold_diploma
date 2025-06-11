from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.core.database import init_db
from app.api.endpoints.auth import router as auth_router
from app.api.endpoints.chords import router as chords_router
from app.api.endpoints.songs import router as songs_router


app = FastAPI(title="Гітарні акорди та пісні", version="1.0.0")


@app.on_event("startup")
def _startup():
    init_db()

app.include_router(songs_router)
app.include_router(auth_router)
app.include_router(chords_router)

# статика для зображень/аудіо акордів
app.mount("/static", StaticFiles(directory="static"), name="static")

