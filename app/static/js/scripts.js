
"use strict";

document.addEventListener('DOMContentLoaded', () => {

    // Список книг для фильтрации
    let allBooks = [];

    // Текущий фильтр
    let activeFilter = null;

    // Загрузка книг при открытии страницы
    fetchBooks();

    // ==========================================
    // 1. СОЗДАНИЕ КНИГИ
    // ==========================================

    const createForm = document.getElementById('create-book-form');

    createForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const book = {
            book_name: document.getElementById('book_name').value,
            author: document.getElementById('author').value,
            genre: document.getElementById('genre').value,
            date_issue: document.getElementById('date_issue').value,
            price: parseFloat(document.getElementById('price').value)
        };

        try {
            const response = await fetch('/api/books/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(book)
            });

            if (response.ok) {
                const newBook = await response.json();

                alert(
                    `Book created: ${newBook.book_name} by ${newBook.author}`
                );

                createForm.reset();
                await fetchBooks();

            } else {
                const error = await response.json();
                alert(`Error: ${JSON.stringify(error.detail)}`);
            }

        } catch (error) {
            console.error('Error creating book:', error);
            alert('Error creating book');
        }
    });


    // ==========================================
    // 2. ПРОСМОТР КНИГИ ПО ID
    // ==========================================

    const viewForm = document.getElementById('view-book-form');

    viewForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const bookId = document.getElementById('view_book_id').value;
        const resultDiv = document.getElementById('view-book-result');

        try {
            const response = await fetch(`/api/books/${bookId}`);

            if (response.ok) {
                const book = await response.json();

                resultDiv.replaceChildren();

                const heading = document.createElement('h4');
                heading.textContent = 'Book Details:';
                resultDiv.appendChild(heading);

                const fields = [
                    ['ID', book.id],
                    ['Name', book.book_name],
                    ['Author', book.author],
                    ['Genre', book.genre],
                    ['Date of Issue', book.date_issue],
                    ['Price', `$${Number(book.price).toFixed(2)}`]
                ];

                fields.forEach(([label, value]) => {
                    const paragraph = document.createElement('p');
                    const strong = document.createElement('strong');

                    strong.textContent = `${label}: `;
                    paragraph.appendChild(strong);
                    paragraph.appendChild(
                        document.createTextNode(String(value))
                    );

                    resultDiv.appendChild(paragraph);
                });

            } else {
                const error = await response.json();
                resultDiv.textContent =
                    `Error: ${JSON.stringify(error.detail)}`;
            }

        } catch (error) {
            console.error('Error fetching book:', error);
            resultDiv.textContent = 'Error fetching book';
        }
    });


    // ==========================================
    // 3. ОБНОВЛЕНИЕ КНИГИ
    // ==========================================

    const updateForm = document.getElementById('update-book-form');

    updateForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const bookId = document.getElementById('update_book_id').value;

        const book = {
            book_name: document.getElementById('update_book_name').value,
            author: document.getElementById('update_author').value,
            genre: document.getElementById('update_genre').value,
            date_issue: document.getElementById('update_date_issue').value,
            price: document.getElementById('update_price').value
        };

        // Удаляем пустые поля
        Object.keys(book).forEach(key => {
            if (book[key] === '') {
                delete book[key];
            }
        });

        try {
            // Получаем существующую книгу
            const existingResponse = await fetch(
                `/api/books/${bookId}`
            );

            if (!existingResponse.ok) {
                const error = await existingResponse.json();
                alert(`Error: ${JSON.stringify(error.detail)}`);
                return;
            }

            const existingBook = await existingResponse.json();

            // Объединяем старые и новые данные
            const updatedBook = {
                book_name: book.book_name ?? existingBook.book_name,
                author: book.author ?? existingBook.author,
                genre: book.genre ?? existingBook.genre,
                date_issue: book.date_issue ?? existingBook.date_issue,
                price: book.price !== undefined
                    ? parseFloat(book.price)
                    : existingBook.price
            };

            const response = await fetch(
                `/api/books/${bookId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedBook)
                }
            );

            if (response.ok) {
                const updated = await response.json();

                alert(
                    `Book updated: ${updated.book_name} by ${updated.author}`
                );

                updateForm.reset();
                await fetchBooks();

            } else {
                const error = await response.json();
                alert(`Error: ${JSON.stringify(error.detail)}`);
            }

        } catch (error) {
            console.error('Error updating book:', error);
            alert('Error updating book');
        }
    });


    // ==========================================
    // 4. УДАЛЕНИЕ КНИГИ ПО ID
    // ==========================================

    const deleteForm = document.getElementById('delete-book-form');

    deleteForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const bookId = document.getElementById('delete_book_id').value;

        const deleted = await deleteBook(bookId);

        if (deleted) {
            deleteForm.reset();
        }
    });


    // ==========================================
    // 5. ДОМАШНЕЕ ЗАДАНИЕ:
    // ФИЛЬТРАЦИЯ ТАБЛИЦЫ
    // ==========================================

    const filterForm = document.getElementById('filter-books-form');
    const resetFilterButton = document.getElementById('reset-filter');

    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const searchText = document.getElementById('filter-text')
            .value.trim().toLowerCase();

        const field = document.getElementById('filter-field').value;

        activeFilter = {
            field: field,
            searchText: searchText
        };

        applyFilter();
    });

    // Сброс фильтра
    resetFilterButton.addEventListener('click', () => {
        filterForm.reset();
        activeFilter = null;
        populateBooksTable(allBooks);
    });

    // Применение фильтра
    function applyFilter() {

        if (activeFilter === null) {
            populateBooksTable(allBooks);
            return;
        }

        const filteredBooks = allBooks.filter(book => {

            const value = String(
                book[activeFilter.field] ?? ''
            ).toLowerCase();

            return value.includes(activeFilter.searchText);
        });

        populateBooksTable(filteredBooks);
    }


    // ==========================================
    // 6. ЗАГРУЗКА КНИГ ИЗ БАЗЫ ДАННЫХ
    // ==========================================

    async function fetchBooks() {
        try {
            const response = await fetch('/api/books/');

            if (response.ok) {
                allBooks = await response.json();

                // Обновляем таблицу с учётом фильтра
                applyFilter();

            } else {
                console.error('Error fetching books');
            }

        } catch (error) {
            console.error('Error fetching books:', error);
        }
    }


    // ==========================================
    // 7. ЗАПОЛНЕНИЕ ТАБЛИЦЫ КНИГ
    // ==========================================

    function populateBooksTable(books) {

        const tbody = document.querySelector(
            '#books-table tbody'
        );

        tbody.replaceChildren();

        if (books.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');

            td.colSpan = 7;
            td.textContent = 'No books found';

            tr.appendChild(td);
            tbody.appendChild(tr);
            return;
        }

        books.forEach(book => {

            const tr = document.createElement('tr');

            const values = [
                book.id,
                book.book_name,
                book.author,
                book.genre,
                book.date_issue,
                `$${Number(book.price).toFixed(2)}`
            ];

            values.forEach(value => {
                const td = document.createElement('td');
                td.textContent = String(value);
                tr.appendChild(td);
            });

            // Домашнее задание №2:
            // кнопка Delete в каждой строке
            const actionCell = document.createElement('td');

            const deleteButton = document.createElement('button');

            deleteButton.type = 'button';
            deleteButton.className = 'btn btn-danger btn-sm';
            deleteButton.textContent = 'Delete';

            deleteButton.addEventListener('click', async () => {
                await deleteBook(book.id);
            });

            actionCell.appendChild(deleteButton);
            tr.appendChild(actionCell);

            tbody.appendChild(tr);
        });
    }


    // ==========================================
    // 8. ОБЩАЯ ФУНКЦИЯ УДАЛЕНИЯ КНИГИ
    // ==========================================

    async function deleteBook(bookId) {

        if (!confirm(
            `Are you sure you want to delete book ID ${bookId}?`
        )) {
            return false;
        }

        try {
            const response = await fetch(
                `/api/books/${bookId}`,
                {
                    method: 'DELETE'
                }
            );

            if (response.ok) {
                const deletedBook = await response.json();

                alert(
                    `Book deleted: ${deletedBook.book_name} by ${deletedBook.author}`
                );

                await fetchBooks();
                return true;

            } else {
                const error = await response.json();
                alert(`Error: ${JSON.stringify(error.detail)}`);
                return false;
            }

        } catch (error) {
            console.error('Error deleting book:', error);
            alert('Error deleting book');
            return false;
        }
    }

});
