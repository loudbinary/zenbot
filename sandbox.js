function convertToBTC(satoshis){
  var satoshi_string = satoshis.toString()
  var len_satoshi   = satoshi_string.length
  if (len_satoshi < 9){
    concat_string = concat_zeroes(9 - len_satoshi, satoshi_string)
  }
  var btc_len = concat_string.length
  var decimal_place = btc_len-8
  var bitcoin_string = concat_string.slice(0,decimal_place).concat('.').concat(concat_string.slice(decimal_place, btc_len))
  return bitcoin_string
}

function concat_zeroes(num_zeroes, string1){
  while(num_zeroes){
    string1 = '0'.concat(string1)
    num_zeroes -= 1
  }
  return string1
}

Number.prototype.noExponents= function(){
  var data= String(this).split(/[eE]/)
  if(data.length== 1) return data[0]

  var  z= '', sign= this<0? '-':'',
    str= data[0].replace('.', ''),
    mag= Number(data[1])+ 1

  if(mag<0){
    z= sign + '0.'
    while(mag++) z += '0'
    return z + str.replace(/^\-/,'')
  }
  mag -= str.length
  while(mag--) z += '0'
  return str + z
}


let answer = 1
console.log(answer.noExponents())
