import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import { Login } from './components/Auth/Login';
import { Signup } from './components/Auth/Signup';
import Home from './components/Home';
import { Jobs } from './components/Jobs';
import { Browse } from './components/Browse';
import { Profile } from './components/Profile';
import JobDescription from './components/JobDescription';
import Companies from './components/admin/Companies';
import CompanyCreate from './components/admin/CompanyCreate';
import CompanySetup from './components/admin/CompanySetup';
import AdminJobs from './components/admin/AdminJobs';
import PostJob from './components/admin/PostJob';
import Applicants from './components/admin/Applicants';
import ProtectedRoute from './components/admin/ProtectedRoute';

const appRouter = createBrowserRouter([
  {
    path: '/',
    element:<ProtectedRoute><Home/></ProtectedRoute> 
  },
  {
    path: '/login',
    element:<Login/>
  },
  {
    path: '/signup',
    element: <Signup/>
  },
  {
    path: '/jobs',
    element:<Jobs/>
  },
  {
    path: '/description/:id',
    element:<JobDescription/>
  },
  {
    path: '/browse',
    element:<ProtectedRoute><Browse/></ProtectedRoute>
  },
  {
    path: '/profile',
    element:<ProtectedRoute><Profile/></ProtectedRoute>
  },
  // admin side 
  {
    path:'/admin/companies',
    element:<ProtectedRoute><Companies/></ProtectedRoute>
  },
  {
    path:'/admin/companies/create',
    element:<ProtectedRoute><CompanyCreate/></ProtectedRoute>
  },
  {
    path:'/admin/companies/:id',
    element:<ProtectedRoute><CompanySetup/></ProtectedRoute>
  },
  {
    path:'/admin/jobs',
    element:<ProtectedRoute><AdminJobs/></ProtectedRoute>
  },
  {
    path:'/admin/jobs/create',
    element:<ProtectedRoute><PostJob/></ProtectedRoute>
  },
  {
    path:'/admin/jobs/:id/applicants',
    element:<ProtectedRoute><Applicants/></ProtectedRoute>
  }
])

function App() {
  return (
    <>
      <RouterProvider router={appRouter}/>
    </>
  )
}

export default App
