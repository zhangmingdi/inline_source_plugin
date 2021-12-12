const HtmlWebpackPlugin = require('html-webpack-plugin')

class InlineSourcePlugin {

    constructor({ match }) {
        this.reg = match
    }

    processTag(tag, compilation) {
        let newTag, url
        if (tag.tagName === 'script' && this.reg.test(tag.attributes.src)) {
            newTag = {
                tagName: 'script'
            }
            url = tag.attributes.src
        }
        if (tag.tagName === 'link' && this.reg.test(tag.attributes.href)) {
            newTag = {
                tagName: 'style'
            }
            url = tag.attributes.href
        }
        if (url) {
            //拿到内容直接替换
            newTag.innerHTML = compilation.assets[url].source()
            delete compilation.assets[url]
            return newTag
        }
        return tag
    }

    processTags(data, compilation) {
        const headTags = []
        data.headTags?.forEach(vo => {
            headTags.push(this.processTag(vo, compilation))
        });
        return {
            ...data,
            headTags
        }
    }

    apply(compiler) {
        compiler.hooks.compilation.tap('HtmlWebpackPlugin', (compilation) => {
            HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync('alterAssetTagGroups', (data, cb) => {
                data = this.processTags(data, compilation)
                cb(null, data)
            })
        })
    }
}


module.exports = InlineSourcePlugin