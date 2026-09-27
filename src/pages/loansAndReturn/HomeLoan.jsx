import React from 'react'

const HomeLoan = () => {
    return (
        <div className="relative h-[628px] w-full overflow-hidden bg-blue-100">
            <img
                src="https://i.pinimg.com/736x/3f/42/b1/3f42b14ca8ba7448634ef01250d74dce.jpg"
                alt=""
                className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/55 text-center justify-center flex items-center">
               <div>
                    <h1 className='text-4xl font-bold text-blue-500/80'>
                        Welcome to Library 
                    </h1>
                    <p className='text-white/80 text-lg'>
                        A library is a place for gaining knowledge
                    </p>
               </div>
            </div>
        </div>
    )
}

export default HomeLoan