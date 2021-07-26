import {expect} from "chai";
import {funclate} from "../src";

describe("literal/attribute", function () {
    let el
    beforeEach(() => {
        if (el) {
            el.parentNode.removeChild(el)
        }
        el = document.body.appendChild(document.createElement("div"))
    })
    it("should parse attributes", function () {
        const value = 1
        const template = funclate`<p><input type="number" value="${value}" ></p>`
        template.render(el)
        expect(el.innerHTML).to.be.eq(`<p><input type="number" value="1"></p>`)
    })
    it("should parse complex attributes", function () {
        const foo = "foo"
        const bar = "bar"
        const template = funclate`<p><input type="text" name="${foo}" value="before ${bar} after" ></p>`
        template.render(el)
        expect(el.innerHTML).to.be.eq(`<p><input type="text" name="foo" value="before bar after"></p>`)
    })
})
