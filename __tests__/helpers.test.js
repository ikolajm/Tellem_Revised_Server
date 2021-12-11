const colorGenerator = require('../helpers/backgroundGenerator');

describe('Background color generator', () => {
    test('Determine if color generator returns a color', () => {
        const colors = [
            "red",
            "blue",
            "green",
            "orange",
            "darkslategrey",
            "purple",
            "pink",
            "brown"
        ]
        const colorGen = colorGenerator.generate()
        expect(colors).toContain(colorGen)
    })
})