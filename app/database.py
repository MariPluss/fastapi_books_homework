from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from .models import Base

# URL для подключения к базе данных SQLite
SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

# Создание асинхронного двигателя SQLAlchemy
engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=True,  # Логи SQL-запросов
)

# Создание асинхронной сессии
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Зависимость для получения сессии базы данных
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# Функция для инициализации базы данных (создание таблиц)
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
