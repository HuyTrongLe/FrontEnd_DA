import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

function RecipeCard({ recipe }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/recipe-detail/${recipe.recipeId}`);
  };

  return (
    <div
      className="book block p-px cursor-pointer rounded-lg"
      onClick={handleCardClick}
    >
      <div className="book-container p-2 rounded-lg shadow-md">
        {/* Recipe Image */}
        <img
          src={recipe.images && recipe.images.length > 0 ? recipe.images[0].imageUrl : "https://via.placeholder.com/150?text=No+Image"}
          alt={recipe.recipeName}
          className="block w-full h-72 mb-4 object-cover object-center rounded-lg"
        />

        {/* Recipe Name */}
        <h3 className="font-medium text-gray-900 text-lg text-center mb-2">
          {recipe.recipeName}
        </h3>

        {/* Recipe Price */}
        <div className="text-center text-gray-300 text-lg font-semibold mb-4">
          <span className="text-pink-700">
            {recipe.price === 0 ? (
              <span className="text-green-600">Miễn Phí</span>
            ) : (
              <>
                {recipe.price.toLocaleString()} Xu
                <img src="/images/icon/dollar.png" alt="coins" className="h-5 w-5 mb-1 ml-1 inline-block" />
              </>
            )}
          </span>
        </div>

        {/* Button to view recipe details */}
        <div className="flex justify-center">
          <button
            className="text-black bg-gray-300 px-6 py-2 rounded font-semibold hover:scale-105 transform transition shadow-lg flex"
            onClick={handleCardClick}
          >
            Xem chi tiết<span className="material-icons ml-2">
              info
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

RecipeCard.propTypes = {
  recipe: PropTypes.object.isRequired,
};

export default RecipeCard;
