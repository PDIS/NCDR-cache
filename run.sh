chrome-har-capturer \
-o light.har \
-g 10000 \
-c "http://itwapi.ncdr.nat.gov.tw/web/apiIndex.aspx?PageId=221&Cx=121&Cy=23.5&Scale=3&Info=Y&MapControl=Y&AddrLoc=Y&Token=YuDz2cxPv9XJ"

git clone https://github.com/outersky/har-tools.git

go run harx.go -x light light.har

mv light/itwapi.ncdr.nat.gov.tw/web/apiIndex.aspx light/itwapi.ncdr.nat.gov.tw/web/index.html

mv light/223.200.166.9/* light/itwapi.ncdr.nat.gov.tw/
mv light/223.200.166.10/* light/itwapi.ncdr.nat.gov.tw/


find light -type f -exec sed -i "s/type: 'post'/type: 'get'/g" {} +

find light -type f -exec sed -i "s/http:\/\/223.200.166.9//g" {} +

find light -type f -exec sed -i "s/http:\/\/223.200.166.10//g" {} +

find light -type f -exec sed -i "s/(location.protocol === 'file:' ? 'http:' : location.protocol) + '\/\/' + \"223.200.166.10/\"/g" {} +
