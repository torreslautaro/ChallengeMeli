import fetch from "node-fetch"
import fs from "fs"
import { stringify } from "csv-stringify";


const URL_API = "https://api.mercadolibre.com" //search?q=chromecast&limit=50#json"

const PRODUCTS_TYPES = ['chromecast', 'apple tv', 'amazon fire tv','google home']

const FILENAME = "ComparativeOfProducts-Meli.csv"
const writableStream = fs.createWriteStream(FILENAME)

const columns = [
    "title",
    "price",
    "base_price",
    "available_quantity",
    "sold_quantity",
    "condition",
    "warranty"
]

const stringifier = stringify({header:true, columns:columns, delimiter:',', bom: true})

async function dataFetch({url}) {
    const res = await fetch(url)
    const data = res.json()
    return data
}

async function generateCSV({products}) {
    products.forEach(product => {
        const url = `${URL_API}/items/${product.id}`
        dataFetch({url}).then(res => {
            const data = {
                title : res.title.replace(',',''),
                price : res.price,
                base_price : res.base_price,
                available_quantity : res.available_quantity,
                sold_quantity : res.sold_quantity,
                condition : res.condition,
                warranty : res.warranty
            }
            stringifier.write(data)
        })
    })
}

PRODUCTS_TYPES.forEach(type => {
    const url = `${URL_API}/sites/MLA/search?q=${type}&limit=50`
    dataFetch({url})
        .then(data => generateCSV({products:data.results}))
})

stringifier.pipe(writableStream);

