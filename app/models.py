from sqlalchemy import Column, Integer, String, Float, Date
from sqlalchemy.ext.declarative import declarative_base

# Создаем базовый класс для моделей SQLAlchemy
Base = declarative_base()

class Book(Base):
    __tablename__ = 'books'

    id = Column(Integer, primary_key=True, index=True)  # id книги
    book_name = Column(String, index=True, nullable=False)  # Название книги
    author = Column(String, nullable=False)  # Автор книги
    genre = Column(String, nullable=False)  # Жанр книги
    date_issue = Column(Date, nullable=False)  # Дата выпуска книги
    price = Column(Float, nullable=False)  # Цена книги

    def __repr__(self):
        return f"<Book(id={self.id}, book_name={self.book_name}, author={self.author}, genre={self.genre}, date_issue={self.date_issue}, price={self.price})>"
