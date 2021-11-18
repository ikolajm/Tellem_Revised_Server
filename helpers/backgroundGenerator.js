const generate = () => {
    const colors = [
      "red",
      "blue",
      "green",
      "orange",
      "darkslategrey",
      "purple",
      "pink",
      "brown"
    ];

    let userColor = colors[Math.floor(Math.random() * colors.length)];
    return userColor;
}

module.exports = { generate };