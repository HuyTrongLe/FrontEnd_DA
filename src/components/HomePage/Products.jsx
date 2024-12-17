import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { searchRecipe, searchBook, searchEbook } from '../services/SearchService';

const Product = () => {
    const { searchString = "" } = useParams();
    const [Recipes, setRecipes] = useState([]);
    const [Books, setBooks] = useState([]);
    const [Ebooks, setEbooks] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const fetchProducts = async () => {
            try {
                const recpie = await searchRecipe(searchString);
                const book = await searchBook(searchString);
                const ebook = await searchEbook(searchString);
                setRecipes(recpie.slice(0, 8));
                setBooks(book.slice(0, 8));
                setEbooks(ebook.slice(0, 8));
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [searchString]);

    return (
        <section className="section-center">
            <div className='container'>
                {loading ? (
                    <div className="d-flex justify-content-center">
                        <div className="spinner-border" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                ) : Recipes.length === 0 && Books.length === 0 && Ebooks.length === 0 ? (
                    <h3 className='text-red-500 text-3xl'>Không tìm thấy sản phẩm: "{searchString}"</h3>
                ) : (
                    <div>
                        <h1 className='mb-5 text-3xl'>Kết quả tìm kiếm: "{searchString}"</h1>
                        {Recipes.length > 0 && (
                            <div className="container mx-auto px-4 mt-8">
                                {/* Tiêu đề */}
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-extrabold text-gray-800">Công thức nấu ăn</h3>
                                    <a
                                        href={`/recipe/${searchString}`}
                                        className="text-custom-orange hover:text-orange-600 font-medium transition duration-300"
                                    >
                                        Xem thêm
                                    </a>
                                </div>

                                {/* Grid layout */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {Recipes.map((recipe, index) => (
                                        <div
                                            key={index}
                                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 flex flex-col h-full"
                                        >
                                            {/* Hình ảnh */}
                                            <img
                                                className="w-full h-64 object-cover"
                                                src={recipe.images[0].imageUrl}
                                                alt={recipe.name}
                                            />

                                            {/* Nội dung */}
                                            <div className="p-2 flex-grow">
                                                <h5 className="text-lg font-medium text-gray-800 mb-2 min-h-14">
                                                    {recipe.recipeName}
                                                </h5>
                                                <p className="text-red-600 font-bold mb-2 text-lg">
                                                    {recipe.price === 0 ? (
                                                        <span className='text-green-600'>Miễn Phí</span>
                                                    ) : (
                                                        <span>
                                                            {Intl.NumberFormat('de-DE').format(recipe.price)} Xu
                                                            <img src="/images/icon/dollar.png" alt="coins" className="h-5 w-5 mb-1 ml-1 inline-block" />
                                                        </span>
                                                    )}
                                                </p>
                                                <a
                                                    href={`/recipe-detail/${recipe.recipeId}`}
                                                    className="block w-full text-center bg-custom-orange text-white py-2 rounded-md hover:bg-orange-600 transition duration-300"
                                                >
                                                    Xem chi tiết
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {Ebooks.length > 0 && (
                            <div className="container mx-auto px-4 mt-8">
                                {/* Tiêu đề */}
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-extrabold text-gray-800">Sách điện tử</h3>
                                    <a
                                        href={`/ebook`}
                                        className="text-custom-orange hover:text-orange-600 font-medium transition duration-300"
                                    >
                                        Xem thêm
                                    </a>
                                </div>

                                {/* Grid layout */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {Ebooks.map((ebook, index) => (
                                        <div
                                            key={index}
                                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 flex flex-col h-full"
                                        >
                                            {/* Hình ảnh */}
                                            <img
                                                className="w-full h-64 object-cover"
                                                src={ebook.imageUrl}
                                                alt={ebook.name}
                                            />

                                            {/* Nội dung */}
                                            <div className="p-4 flex-grow">
                                                <h5 className="text-lg font-medium text-gray-800 mb-2 min-h-14">
                                                    {ebook.ebookName}
                                                </h5>
                                                <p className="text-red-600 font-bold mb-2 text-lg">
                                                    {ebook.price === 0 ? (
                                                        <span className='text-green-600'>Miễn Phí</span>
                                                    ) : (
                                                        <span>
                                                            {Intl.NumberFormat('de-DE').format(ebook.price)} Xu
                                                            <img src="/images/icon/dollar.png" alt="coins" className="h-5 w-5 mb-1 ml-1 inline-block" />
                                                        </span>
                                                    )}

                                                </p>
                                                <a
                                                    href={`/ebook/${ebook.ebookId}`}
                                                    className="block w-full text-center bg-custom-orange text-white py-2 rounded-md hover:bg-orange-600 transition duration-300"
                                                >
                                                    Xem chi tiết
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {Books.length > 0 && (
                            <div className="container mx-auto px-4 mt-8">
                                {/* Tiêu đề */}
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-extrabold text-gray-800">Sách nấu ăn</h3>
                                    <a
                                        href={`/book/${searchString}`}
                                        className="text-custom-orange hover:text-orange-600 font-medium transition duration-300"
                                    >
                                        Xem thêm
                                    </a>
                                </div>

                                {/* Grid layout */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {Books.map((book, index) => (
                                        <div
                                            key={index}
                                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 flex flex-col h-full"
                                        >
                                            {/* Hình ảnh */}
                                            <img
                                                className="w-full h-64 object-cover"
                                                src={book.images[0].imageUrl}
                                                alt={book.name}
                                            />

                                            {/* Nội dung */}
                                            <div className="p-4 flex-grow">
                                                <h5 className="text-lg font-medium text-gray-800 mb-2 min-h-14">
                                                    {book.bookName}
                                                </h5>
                                                <p className="text-red-600 font-bold mb-2 text-lg">
                                                    {Intl.NumberFormat('de-DE').format(book.price)}
                                                    <img src="/images/icon/dollar.png" alt="coins" className="h-5 w-5 mb-1 ml-1 inline-block" />
                                                </p>
                                                <a
                                                    href={`/book-detail/${book.bookId}`}
                                                    className="block w-full text-center bg-custom-orange text-white py-2 rounded-md hover:bg-blue-500 transition duration-300"
                                                >
                                                    Chi tiết
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};
export default Product;
