var $ = require('jquery')(require('jsdom-no-contextify').jsdom().parentWindow);
var nodemailer = require('nodemailer');
// Support for Cross-domain request with using jQuery
// See: http://garajeando.blogspot.jp/2012/06/avoiding-xmlhttprequest-problem-using.html
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
$.support.cors = true;
$.ajaxSettings.xhr = function () {
    return new XMLHttpRequest;
}
var productArrayLessThan = [];

function convertVietnamese(str) {
    str= str.toLowerCase();
    str= str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a");
    str= str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e");
    str= str.replace(/ì|í|ị|ỉ|ĩ/g,"i");
    str= str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o");
    str= str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u");
    str= str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y");
    str= str.replace(/đ/g,"d");
    str= str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'| |\"|\&|\#|\[|\]|~|$|_/g,"-");
    str= str.replace(/-+-/g,"-");
    str= str.replace(/^\-+|\-+$/g,"");

    return str;
}

function getProductsLessThreshold(priceThreshold, productName, offset) {
    // Danh mục nội thất đồ da dụng, sau này mở rộng sẽ sửa chữa sau.
    $.ajax({
        url: 'https://gateway.chotot.com/v1/public/ad-listing',
        type: 'GET',
        data: {
            region: '13',// ho chi minh,
            w: '1',
            limit: 20,
            st: 's,k',
            cg: '9000',
            q: productName,
            o: offset
        },
        success:  function(data, status, jq_xhr) {
            var productArray = data.ads;
            for(var item in productArray) {
                if(productArray[item].price <= priceThreshold) {
                    productArrayLessThan.push(productArray[item]);
                }
            }
            if(productArray.length > 0) {
                getProductsLessThreshold(priceThreshold, productName, offset + 20);
            } else {
                console.log('data: ', productArrayLessThan.length);
                if(productArrayLessThan.length > 0) {
                    console.log('Have new product');
                    //console.log('data: ', productArrayLessThan)
                    var htmlContent = '';
                    productArrayLessThan.map(function(item, index) {
                        var subject = convertVietnamese(item.subject);
                        var area_name = convertVietnamese(item.area_name);
                        var list_id = item.list_id;
                        var category = 'mua-ban-noi-ngoai-that-cay-canh'; // hard code
                        var prefix = 'https://www.chotot.com/'
                        var productUrl = index + 1 + '. ' + item.subject+ ': ' + prefix + area_name + '/' + category + '/' + subject + '-' + list_id + '.htm';
                        htmlContent += '<p>' + productUrl + '</p>'
                        return productUrl;
                    });
                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'email của người gửi, nhập vô nh',
                            pass: 'p'
                        }
                    });

                    var mailOptions = {
                        from: 'email của người g',
                        to: 'email của người nh',
                        subject: 'Have new products',
                        html: htmlContent
                    };

                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                            console.log('error: ', error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                }
            }
        },
        error: function(jq_xhr, status, error_str) {
            console.log('error: ', error_str);
        }
    });
}
var englishString = convertVietnamese('Giường sắt 2 tầng hộp vuông. Sơn tĩnh điện. Bh 1N');
getProductsLessThreshold(800000, 'giường tầng', 0);
/*
setInterval( getBedProductsHavePriceLessThan800 ,5000);*/
