import Image from 'next/image';

export default function ComponentCard({ title, image }: { title: string, image: string }) {
    return (
        <div className='w-full border border-gray-300 rounded-lg shadow-lg bg-gradient-to-tr from-primary via-primary/10 via-40% to-primary/5 
        hover:shadow-xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 ease-in-out'>

            <div className="flex gap-4 p-4 pt-0 h-full w-full justify-between items-center text-center text-white">

                <div className="flex flex-wrap gap-4 justify-center items-center -rotate-45 relative">

                    <Image src={image} alt={title} width={100} height={100} className="-bottom-80" />
                
                </div>

                <div className="flex flex-col gap-1 p-4 py-2 h-full w-max justify-center items-center text-center text-white">

                    <h2 className="text-lg font-bold">{title}</h2>
                    <p className="text-sm text-gray-500">Description of {title}</p>
                    <p className="text-sm text-gray-500">Description of {title}</p>
                    <p className="text-sm text-gray-500">Description of {title}</p>

                </div>

            </div>
        </div>
    );
};
