// interface Book {
//     id: string
//     title: string
//     author: string
//     genre: string
//   }
  
//   interface BookListProps {
//     books: Book[]
//   }
  
//   export function BookList({ books }: BookListProps) {
//     return (
//       <ul className="space-y-4 mt-4">
//         {books.map((book) => (
//           <li key={book.id} className="border p-4 rounded-md">
//             <h3 className="text-lg font-semibold">{book.title}</h3>
//             <p className="text-sm text-gray-600">by {book.author}</p>
//             <p className="text-sm text-gray-500">Genre: {book.genre}</p>
//           </li>
//         ))}
//       </ul>
//     )
//   }
  
  