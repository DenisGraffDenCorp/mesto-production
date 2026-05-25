const cardTemplate = document.querySelector('#card-template').content;

export const updateCardLike = (cardElement, card, currentUserId) => {
  const likeButton = cardElement.querySelector('.card__like-button');
  const likeCount = cardElement.querySelector('.card__like-count');
  const isLiked = card.likes.some((user) => user._id === currentUserId);

  likeButton.classList.toggle('card__like-button_is-active', isLiked);
  likeButton.setAttribute('aria-label', isLiked ? 'Убрать лайк' : 'Поставить лайк');
  likeCount.textContent = card.likes.length;
};

export const createCard = (card, currentUserId, handleImageClick, handleDeleteClick, handleLikeClick) => {
  const cardElement = cardTemplate.querySelector('.card').cloneNode(true);
  const cardImage = cardElement.querySelector('.card__image');
  const cardTitle = cardElement.querySelector('.card__title');
  const cardControl = cardElement.querySelector('.card__control');
  const deleteButton = cardElement.querySelector('.card__control-button_type_delete');
  const likeButton = cardElement.querySelector('.card__like-button');

  cardImage.src = card.link;
  cardImage.alt = card.name;
  cardTitle.textContent = card.name;

  if (card.owner._id !== currentUserId) {
    cardControl.remove();
  } else {
    deleteButton.addEventListener('click', () => handleDeleteClick(card, cardElement));
  }

  updateCardLike(cardElement, card, currentUserId);

  cardImage.addEventListener('click', () => handleImageClick(card));
  likeButton.addEventListener('click', () => handleLikeClick(card, cardElement));

  return cardElement;
};
