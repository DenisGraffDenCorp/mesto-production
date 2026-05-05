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

const getTotalUsers = (cards) => {
  const userIds = new Set();

  cards.forEach((card) => {
    userIds.add(card.owner._id);
    card.likes.forEach((user) => userIds.add(user._id));
  });

  return userIds.size;
};

const getLikesChampion = (cards, currentUser) => {
  const likesByUser = new Map();

  cards.forEach((card) => {
    card.likes.forEach((user) => {
      const current = likesByUser.get(user._id) ?? { name: user.name, count: 0 };
      likesByUser.set(user._id, { name: user.name, count: current.count + 1 });
    });
  });

  const champion = Array.from(likesByUser.values()).sort((a, b) => b.count - a.count)[0];
  return champion ?? { name: currentUser?.name ?? 'Пока нет', count: 0 };
};

export const renderCardStatistics = (cards, currentUser, elements) => {
  const totalLikes = cards.reduce((sum, card) => sum + card.likes.length, 0);
  const champion = getLikesChampion(cards, currentUser);
  const maxCardLikes = cards.reduce((max, card) => Math.max(max, card.likes.length), 0);
  const popularCards = cards.filter((card) => card.likes.length === maxCardLikes && maxCardLikes > 0).slice(0, 3);

  elements.definitions.replaceChildren(
    createDefinitionElement('Всего пользователей:', getTotalUsers(cards)),
    createDefinitionElement('Всего лайков:', totalLikes),
    createDefinitionElement('Максимально лайков от одного:', champion.count),
    createDefinitionElement('Чемпион лайков:', champion.name)
  );

  const popularCardElements =
    popularCards.length > 0
      ? popularCards.map((card) => createBadgeElement(card.name))
      : [createBadgeElement('Нет лайков')];

  elements.popularCards.replaceChildren(...popularCardElements);
};
