from pydantic import BaseModel
from datetime import date

class BookBase(BaseModel):
    book_name: str
    author: str
    genre: str
    date_issue: date
    price: float

class BookCreate(BookBase):
    pass

class BookUpdate(BookBase):
    id: int

class BookDelete(BaseModel):
    id: int

class Book(BookBase):
    id: int

    class Config:
        orm_mode = True
