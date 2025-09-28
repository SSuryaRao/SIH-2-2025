const { db } = require('../config/database');

class LibraryService {
  constructor() {
    this.booksCollection = db.collection('books');
    this.issuesCollection = db.collection('issues');
    this.settingsCollection = db.collection('settings');
  }

  // Book Management
  async addBook(bookData) {
    try {
      const bookId = `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const book = {
        bookId,
        ...bookData,
        addedDate: new Date(),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.booksCollection.doc(bookId).set(book);

      return {
        success: true,
        data: { bookId, book },
        message: 'Book added successfully'
      };
    } catch (error) {
      console.error('Error adding book:', error);
      return {
        success: false,
        message: 'Failed to add book'
      };
    }
  }

  async getAllBooks(filters = {}) {
    try {
      let query = this.booksCollection;

      // Apply filters
      if (filters.category) {
        query = query.where('category', '==', filters.category);
      }
      if (filters.subject) {
        query = query.where('subject', '==', filters.subject);
      }
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }

      // Add ordering
      query = query.orderBy('title');

      const snapshot = await query.get();
      const books = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        addedDate: doc.data().addedDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));

      return {
        success: true,
        data: books,
        message: 'Books retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting books:', error);
      return {
        success: false,
        message: 'Failed to retrieve books'
      };
    }
  }

  async searchBooks(searchTerm) {
    try {
      const allBooks = await this.getAllBooks();
      if (!allBooks.success) return allBooks;

      const books = allBooks.data.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.some(author => author.toLowerCase().includes(searchTerm.toLowerCase())) ||
        book.isbn.includes(searchTerm) ||
        book.publisher.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.subject && book.subject.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      return {
        success: true,
        data: books,
        message: 'Book search completed successfully'
      };
    } catch (error) {
      console.error('Error searching books:', error);
      return {
        success: false,
        message: 'Failed to search books'
      };
    }
  }

  async getBookById(bookId) {
    try {
      const docSnap = await this.booksCollection.doc(bookId).get();

      if (!docSnap.exists) {
        return {
          success: false,
          message: 'Book not found'
        };
      }

      const book = {
        id: docSnap.id,
        ...docSnap.data(),
        addedDate: docSnap.data().addedDate?.toDate(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate()
      };

      return {
        success: true,
        data: book,
        message: 'Book retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting book:', error);
      return {
        success: false,
        message: 'Failed to retrieve book'
      };
    }
  }

  async updateBook(bookId, updateData) {
    try {
      const docRef = db.collection('books').doc(bookId);
      const updatedBook = {
        ...updateData,
        updatedAt: new Date()
      };

      await docRef.update(updatedBook);

      return {
        success: true,
        message: 'Book updated successfully'
      };
    } catch (error) {
      console.error('Error updating book:', error);
      return {
        success: false,
        message: 'Failed to update book'
      };
    }
  }

  async deleteBook(bookId) {
    try {
      // Check if book has any active issues
      const activeIssues = await this.getBookActiveIssues(bookId);
      if (activeIssues.success && activeIssues.data.length > 0) {
        return {
          success: false,
          message: 'Cannot delete book with active issues'
        };
      }

      const docRef = db.collection('books').doc(bookId);
      await docRef.delete();

      return {
        success: true,
        message: 'Book deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting book:', error);
      return {
        success: false,
        message: 'Failed to delete book'
      };
    }
  }

  // Issue Management
  async issueBook(issueData) {
    try {
      // Check if book is available
      const bookResult = await this.getBookById(issueData.bookId);
      if (!bookResult.success) return bookResult;

      const book = bookResult.data;
      if (book.availableCopies <= 0) {
        return {
          success: false,
          message: 'Book is not available for issue'
        };
      }

      // Check student's current issues count
      const studentIssues = await this.getStudentActiveIssues(issueData.studentId);
      if (studentIssues.success && studentIssues.data.length >= 5) { // Max 5 books per student
        return {
          success: false,
          message: 'Student has reached maximum book limit'
        };
      }

      const issueId = `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 14 days issue period

      const issue = {
        issueId,
        ...issueData,
        issueDate: new Date(),
        dueDate: dueDate,
        status: 'issued',
        fineAmount: 0,
        fineStatus: 'none',
        renewalCount: 0,
        condition: {
          atIssue: 'good'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Create issue record
      const issueDocRef = db.collection('issues').doc(issueId);
      await issueDocRef.set(issue);

      // Update book available copies
      const bookDocRef = db.collection('books').doc(issueData.bookId);
      await bookDocRef.update({
        availableCopies: book.availableCopies - 1,
        updatedAt: new Date()
      });

      return {
        success: true,
        data: { issueId, issue },
        message: 'Book issued successfully'
      };
    } catch (error) {
      console.error('Error issuing book:', error);
      return {
        success: false,
        message: 'Failed to issue book'
      };
    }
  }

  async returnBook(issueId, returnData) {
    try {
      const issueResult = await this.getIssueById(issueId);
      if (!issueResult.success) return issueResult;

      const issue = issueResult.data;
      if (issue.status !== 'issued') {
        return {
          success: false,
          message: 'Book is not currently issued'
        };
      }

      // Calculate fine if overdue
      const currentDate = new Date();
      const dueDate = new Date(issue.dueDate);
      let fineAmount = 0;
      let fineStatus = 'none';

      if (currentDate > dueDate) {
        const overdueDays = Math.ceil((currentDate - dueDate) / (1000 * 60 * 60 * 24));
        fineAmount = overdueDays * 2; // ₹2 per day fine
        fineStatus = 'pending';
      }

      // Update issue record
      const issueDocRef = db.collection('issues').doc(issueId);
      await issueDocRef.update({
        returnDate: new Date(),
        status: 'returned',
        fineAmount: fineAmount,
        fineStatus: fineStatus,
        condition: {
          ...issue.condition,
          atReturn: returnData.condition || 'good'
        },
        returnedTo: returnData.returnedBy,
        notes: returnData.notes || '',
        updatedAt: new Date()
      });

      // Update book available copies
      const bookResult = await this.getBookById(issue.bookId);
      if (bookResult.success) {
        const book = bookResult.data;
        const bookDocRef = db.collection('books').doc(issue.bookId);
        await bookDocRef.update({
          availableCopies: book.availableCopies + 1,
          updatedAt: new Date()
        });
      }

      return {
        success: true,
        data: { fineAmount, fineStatus },
        message: 'Book returned successfully'
      };
    } catch (error) {
      console.error('Error returning book:', error);
      return {
        success: false,
        message: 'Failed to return book'
      };
    }
  }

  async renewBook(issueId) {
    try {
      const issueResult = await this.getIssueById(issueId);
      if (!issueResult.success) return issueResult;

      const issue = issueResult.data;
      if (issue.status !== 'issued') {
        return {
          success: false,
          message: 'Book is not currently issued'
        };
      }

      if (issue.renewalCount >= 2) { // Max 2 renewals
        return {
          success: false,
          message: 'Maximum renewal limit reached'
        };
      }

      // Extend due date by 14 days
      const newDueDate = new Date(issue.dueDate);
      newDueDate.setDate(newDueDate.getDate() + 14);

      const issueDocRef = db.collection('issues').doc(issueId);
      await issueDocRef.update({
        dueDate: newDueDate,
        renewalCount: issue.renewalCount + 1,
        updatedAt: new Date()
      });

      return {
        success: true,
        data: { newDueDate },
        message: 'Book renewed successfully'
      };
    } catch (error) {
      console.error('Error renewing book:', error);
      return {
        success: false,
        message: 'Failed to renew book'
      };
    }
  }

  async getIssueById(issueId) {
    try {
      const docRef = db.collection('issues').doc(issueId);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return {
          success: false,
          message: 'Issue record not found'
        };
      }

      const issue = {
        id: docSnap.id,
        ...docSnap.data(),
        issueDate: docSnap.data().issueDate?.toDate(),
        dueDate: docSnap.data().dueDate?.toDate(),
        returnDate: docSnap.data().returnDate?.toDate(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate()
      };

      return {
        success: true,
        data: issue,
        message: 'Issue record retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting issue:', error);
      return {
        success: false,
        message: 'Failed to retrieve issue record'
      };
    }
  }

  async getStudentActiveIssues(studentId) {
    try {
      const q = db.collection('issues')
        .where('studentId', '==', studentId)
        .where('status', '==', 'issued');

      const snapshot = await q.get();
      const issues = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        issueDate: doc.data().issueDate?.toDate(),
        dueDate: doc.data().dueDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));

      return {
        success: true,
        data: issues,
        message: 'Student active issues retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting student active issues:', error);
      return {
        success: false,
        message: 'Failed to retrieve student active issues'
      };
    }
  }

  async getBookActiveIssues(bookId) {
    try {
      const q = db.collection('issues')
        .where('bookId', '==', bookId)
        .where('status', '==', 'issued');

      const snapshot = await q.get();
      const issues = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        issueDate: doc.data().issueDate?.toDate(),
        dueDate: doc.data().dueDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));

      return {
        success: true,
        data: issues,
        message: 'Book active issues retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting book active issues:', error);
      return {
        success: false,
        message: 'Failed to retrieve book active issues'
      };
    }
  }

  async getOverdueBooks() {
    try {
      const currentDate = new Date();
      const q = db.collection('issues')
        .where('status', '==', 'issued');

      const snapshot = await q.get();
      const overdueIssues = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          issueDate: doc.data().issueDate?.toDate(),
          dueDate: doc.data().dueDate?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        }))
        .filter(issue => new Date(issue.dueDate) < currentDate);

      return {
        success: true,
        data: overdueIssues,
        message: 'Overdue books retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting overdue books:', error);
      return {
        success: false,
        message: 'Failed to retrieve overdue books'
      };
    }
  }

  // Statistics
  async getLibraryStats() {
    try {
      const [booksResult, issuesResult] = await Promise.all([
        this.getAllBooks(),
        this.getAllIssues()
      ]);

      if (!booksResult.success || !issuesResult.success) {
        return {
          success: false,
          message: 'Failed to retrieve library statistics'
        };
      }

      const books = booksResult.data;
      const issues = issuesResult.data;

      const stats = {
        totalBooks: books.length,
        availableBooks: books.reduce((sum, book) => sum + book.availableCopies, 0),
        issuedBooks: books.reduce((sum, book) => sum + (book.totalCopies - book.availableCopies), 0),
        totalIssues: issues.length,
        activeIssues: issues.filter(issue => issue.status === 'issued').length,
        overdueIssues: issues.filter(issue =>
          issue.status === 'issued' && new Date(issue.dueDate) < new Date()
        ).length,
        categoryWise: {},
        popularBooks: {}
      };

      // Calculate category-wise distribution
      books.forEach(book => {
        stats.categoryWise[book.category] = (stats.categoryWise[book.category] || 0) + 1;
      });

      // Calculate popular books (most issued)
      const bookIssueCount = {};
      issues.forEach(issue => {
        bookIssueCount[issue.bookId] = (bookIssueCount[issue.bookId] || 0) + 1;
      });

      Object.entries(bookIssueCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([bookId, count]) => {
          const book = books.find(b => b.bookId === bookId);
          if (book) {
            stats.popularBooks[book.title] = count;
          }
        });

      return {
        success: true,
        data: stats,
        message: 'Library statistics retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting library stats:', error);
      return {
        success: false,
        message: 'Failed to retrieve library statistics'
      };
    }
  }

  async getAllIssues(filters = {}) {
    try {
      let q = db.collection('issues');

      // Apply filters
      if (filters.status) {
        q = q.where('status', '==', filters.status);
      }
      if (filters.studentId) {
        q = q.where('studentId', '==', filters.studentId);
      }

      // Add ordering
      q = q.orderBy('issueDate', 'desc');

      const snapshot = await q.get();
      const issues = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        issueDate: doc.data().issueDate?.toDate(),
        dueDate: doc.data().dueDate?.toDate(),
        returnDate: doc.data().returnDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));

      return {
        success: true,
        data: issues,
        message: 'Issues retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting issues:', error);
      return {
        success: false,
        message: 'Failed to retrieve issues'
      };
    }
  }
}

module.exports = new LibraryService();