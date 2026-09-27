
import './App.css'
import { BrowserRouter,Route,Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import MainLayout from './layout/MainLayout'
import MemberPage from './pages/member/MemberList'
import MemberCreate from './pages/member/MemberCreate'
import AuthorsList from './pages/authors/AuthorsList'
import AuthorsCreate from './pages/authors/AuthorsCreate'
import CategoryList from './pages/category/CategoryList'
import CategoryCreate from './pages/category/CategoryCreate'
import AuthorBookList from './pages/AuthorBook/AuthorBookList'
import AuthorBookForm from './pages/AuthorBook/AuthorBookForm'
import PublishersList from './pages/publishers/PublishersList'
import PublishersCreate from './pages/publishers/PublishersCreate'
import LoansList from './pages/loans/LoansList'
import LoansCreate from './pages/loans/LoansCreate'
import BookList from './pages/books/BookList'
import BookCreate from './pages/books/BookCreate'
import BookCopyList from './pages/bookcopy/BookCopyList'
import BookCopyCreate from './pages/bookcopy/BookCopyCreate'
import LoansDetailList from './pages/loansDetail/LoansDetailList'
import LoansDetailCreate from './pages/loansDetail/LoansDetailCreate'
import BookReturnList from './pages/return/BookReturnList'
import ReturnCreate from './pages/return/ReturnCreate'
import PageLoansAndReturn from './pages/loansAndReturn/Layout'
import LoansBook from './pages/loansAndReturn/LoansBook'
import ReturnBook from './pages/loansAndReturn/ReturnBook'
import AddNewMember from './pages/loansAndReturn/AddNewMember'
import HomeLoan from './pages/loansAndReturn/HomeLoan'
import FineList from './pages/fines/FineList'
import FinesCreate from './pages/fines/FinesCreate'
import FinesPaymentList from './pages/finesPayment/FinesPaymentList'
import FinesPaymentCreate from './pages/finesPayment/FinesPaymentCreate'
import CreatePayment from './pages/loansAndReturn/CreatePayment'
import UserList from './pages/users/UserList'
import UserForm from './pages/users/UserForm'
import Login from './pages/Auth/Login'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/loansReturn" element={<PageLoansAndReturn/>}>
            <Route index element={<HomeLoan/>}/>
            <Route path="/loansReturn/homeLoan" element={<HomeLoan/>}/>
            <Route path="/loansReturn/loansBook" element={<LoansBook/>}/>
            <Route path="/loansReturn/returnBook" element={<ReturnBook/>}/>
            <Route path="/loansReturn/loansReturn/addNewMember" element={<AddNewMember/>}/>
            <Route path="/loansReturn/paymentLate" element={<CreatePayment/>}/>

          </Route>
          
          <Route path="/" element={<MainLayout/>}>
            <Route index element={<HomePage/>} />
            <Route index path="/home" element={<HomePage/>} />

            <Route path="/category" element={<CategoryList/>} />
            <Route path="/category/create" element={<CategoryCreate/>} />
            <Route path="/category/edite/:id" element={<CategoryCreate/>} />

            <Route path="/authors" element={<AuthorsList/>} />
            <Route path="/authors/create" element={<AuthorsCreate/>} />
            <Route path="/authors/edite/:id" element={<AuthorsCreate/>} />

            <Route path="/authorBooks" element={<AuthorBookList/>} />
            <Route path="/authorBooks/create" element={<AuthorBookForm/>} />
            <Route path="/authorBooks/edite/:id" element={<AuthorBookForm/>} />

            <Route path="/publishers" element={<PublishersList/>} />
            <Route path="/publishers/create" element={<PublishersCreate/>} />
            <Route path="/publishers/edite/:id" element={<PublishersCreate/>} />

            <Route path="/member" element={<MemberPage/>} />
            <Route path="/member/create" element={<MemberCreate/>} />
            <Route path="/member/edite/:id" element={<MemberCreate/>} />

            <Route path="/loans" element={<LoansList/>} />
            <Route path="/loans/create" element={<LoansCreate/>} />
            <Route path="/loans/edite/:id" element={<LoansCreate/>} />

            <Route path="/books" element={<BookList/>} />
            <Route path="/books/create" element={<BookCreate/>} />
            <Route path="/books/edite/:id" element={<BookCreate/>} />

            <Route path="/bookcopy" element={<BookCopyList/>} />
            <Route path="/bookcopy/create" element={<BookCopyCreate/>} />
            <Route path="/bookcopy/edite/:id" element={<BookCopyCreate/>} />

            <Route path="/bookReturn" element={<BookReturnList/>} />
            <Route path="/bookReturn/create" element={<ReturnCreate/>} />
            <Route path="/bookReturn/edite/:id" element={<ReturnCreate/>} />

            <Route path="/loansDetail" element={<LoansDetailList/>} />
            <Route path="/loansDetail/create" element={<LoansDetailCreate/>} />
            <Route path="/loansDetail/edite/:id" element={<LoansDetailCreate/>} />

            <Route path="/fines" element={<FineList/>} />
            <Route path="/fines/create" element={<FinesCreate/>} />
            <Route path="/fines/edit/:id" element={<FinesCreate/>} />

            <Route path="/finesPayment" element={<FinesPaymentList/>} />
            <Route path="/finesPayment/create" element={<FinesPaymentCreate/>} />
            <Route path="/finesPayment/edit/:id" element={<FinesPaymentCreate/>} />

            <Route path="/user" element={<UserList/>} />
            <Route path="/user/create" element={<UserForm/>} />
            <Route path="/user/edite/:id" element={<UserForm/>} />
            
            
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
