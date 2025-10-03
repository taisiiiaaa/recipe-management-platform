function groupIngredientsByName(ingredients) {
  const grouped = {};

  ingredients.forEach(({ name, quantity }) => {
    const key = name.trim().toLowerCase();

    if (!grouped[key]) {
      grouped[key] = {
        displayName: name, 
        quantities: []
      };
    }

    if (quantity && quantity.trim()) {
      grouped[key].quantities.push(quantity.trim());
    }
  });

  return Object.values(grouped).map(({ displayName, quantities }) => {
    const quantityText = quantities.length > 0 ? ` ${quantities.join(', ')}` : '';
    return [displayName, quantityText.trim()];
  })
}

export default groupIngredientsByName
