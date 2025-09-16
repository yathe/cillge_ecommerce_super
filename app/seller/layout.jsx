'use client'

import Sidebar from '@/components/seller/Sidebar'
import React from 'react'
import Navbar from "@/components/Navbar";
const Layout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <div className='flex w-full'>
        <Sidebar />
        {children}
      </div>
    </div>
  )
}

export default Layout