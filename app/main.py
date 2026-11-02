from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from . import crud, models, schemas, database

app = FastAPI()

# Монтирование статических файлов
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Настройка шаблонов
templates = Jinja2Templates(directory="app/templates")

# Настройки CORS (можно настроить более строго при необходимости)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Замените на конкретные домены в продакшене
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Зависимость для получения сессии базы данных
async def get_db_session():
    async for session in database.get_db():
        yield session

# Инициализация базы данных при запуске приложения
@app.on_event("startup")
async def startup():
    await database.init_db()

# Маршрут для сервировки главной страницы
@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# API маршруты

# Создание книги
@app.post("/api/books/", response_model=schemas.Book)
async def create_book(book: schemas.BookCreate, db: AsyncSession = Depends(get_db_session)):
    return await crud.create_book(db, book)

# Получение всех книг
@app.get("/api/books/", response_model=list[schemas.Book])
async def read_books(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db_session)):
    books = await crud.get_books(db, skip=skip, limit=limit)
    return books

# Получение книги по ID
@app.get("/api/books/{book_id}", response_model=schemas.Book)
async def read_book(book_id: int, db: AsyncSession = Depends(get_db_session)):
    db_book = await crud.get_book(db, book_id)
    if db_book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return db_book

# Обновление книги
@app.put("/api/books/{book_id}", response_model=schemas.Book)
async def update_book(book_id: int, book: schemas.BookCreate, db: AsyncSession = Depends(get_db_session)):
    db_book = await crud.update_book(db, book_id, book)
    if db_book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return db_book

# Удаление книги
@app.delete("/api/books/{book_id}", response_model=schemas.Book)
async def delete_book(book_id: int, db: AsyncSession = Depends(get_db_session)):
    db_book = await crud.delete_book(db, book_id)
    if db_book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return db_book
