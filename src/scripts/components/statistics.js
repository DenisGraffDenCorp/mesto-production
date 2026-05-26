const definitionTemplate = document.querySelector('#popup-info-definition-template').content;
const badgeTemplate = document.querySelector('#popup-info-user-preview-template').content;

const createDefinitionElement = (term, value) => {
  const fragment = definitionTemplate.cloneNode(true);
  fragment.querySelector('.stats__badge').textContent = term;
  fragment.querySelector('.popup-info__value').textContent = value;
  return fragment;
};

const createBadgeElement = (text) => {
  const badgeElement = badgeTemplate.querySelector('span').cloneNode(true);
  badgeElement.textContent = text;
  return badgeElement;
};

export const getCardsStats = (cards) => {
  const totalUsers = new Set(cards.map((card) => card.owner._id)).size;
  const totalLikes = cards.reduce((sum, card) => sum + card.likes.length, 0);
  const maxCardLikes = cards.reduce((max, card) => Math.max(max, card.likes.length), 0);
  const popularCards = cards.filter((card) => card.likes.length === maxCardLikes && maxCardLikes > 0);
  const championCard = popularCards[0];

  return {
    totalUsers,
    totalLikes,
    maxCardLikes,
    likesChampion: championCard?.owner.name ?? 'Нет данных',
    popularCards: popularCards.slice(0, 3),
  };
};

export const renderCardsStats = (cards, elements) => {
  const stats = getCardsStats(cards);

  elements.definitions.replaceChildren(
    createDefinitionElement('Всего пользователей:', stats.totalUsers),
    createDefinitionElement('Всего лайков:', stats.totalLikes),
    createDefinitionElement('Максимально лайков от одного:', stats.maxCardLikes),
    createDefinitionElement('Чемпион лайков:', stats.likesChampion)
  );

  const popularCardElements =
    stats.popularCards.length > 0
      ? stats.popularCards.map((card) => createBadgeElement(card.name))
      : [createBadgeElement('Нет лайков')];

  elements.popularCards.replaceChildren(...popularCardElements);
};
