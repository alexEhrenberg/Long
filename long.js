/* https://github.com/alexEhrenberg/Long/blob/master/LICENSE */

function Long (n) {
 
  var num;    // array
  var sign;   // sign


  if(n === undefined) {
    this.num = new Array();
    this.num.push('.');
    this.sign = 1;

  } else if(n instanceof Long) {
    this.num = new Array();
    this.num = n.num.slice();
    this.sign = n.sign;
  }

  if(typeof n == "number" || n instanceof Number) {    
    n = n.toString();
  }

  if(typeof n == "string" || n instanceof String) {

    // this lovely regex was taken from:

    /*
      bignumber.js v3.0.1
      A JavaScript library for arbitrary-precision arithmetic.
      https://github.com/MikeMcl/bignumber.js
      Copyright (c) 2016 Michael Mclaughlin <M8ch88l@gmail.com>
      MIT Expat Licence
    */

    var regexObj = /^[+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;    


    if(regexObj.test(n)) {
      var stringArray = n.split("");

      this.sign = 1;
      if(stringArray[0] == '-') {
        this.sign = -1;
        stringArray.shift();
      }
      if(stringArray[0] == '+') {
        stringArray.shift();
      }

      var decimal = stringArray;
      var exponent = 0;

      this.num = new Array();
      this.num.push('.');
      var radix = 0;
      var currentIndex = 0;

      // determine if the string is in scientific notation
      var eIndex = stringArray.indexOf("e");
      if(eIndex != -1) {   
    
        decimal = stringArray.slice(0, eIndex);
        exponent = stringArray.slice(eIndex + 1, stringArray.length);
        
        var eSign = 1;
        if(exponent[0] == '-') {
          eSign = -1;
        }

        exponent = exponent.join("");
        exponent = Number(exponent);

        var size = Math.abs(exponent);

        for(var i = 0; i < size; i++) {
          if(eSign < 0) {
            this.num.push("0");
            currentIndex += 1;
          } else {
            this.num.splice(0,0,"0");
            radix += 1;
          }
        }
      }     

      // split decimal into integer and fraction
      var integer = "";
      var fraction = "";
      var decimalIndex = decimal.indexOf('.');
      if(decimalIndex != -1) {
        integer = decimal.slice(0, decimalIndex);
        fraction = decimal.slice(decimalIndex + 1, decimal.length);
      } else {
        integer = decimal;
      }

      var currentIndexCopy = currentIndex;
      for(var i = integer.length - 1; i >= 0; i--) {

        if(exponent >= 0){
          this.num.splice(0,0,integer[i]);
          radix += 1;
        } else {
          
          if(currentIndex > radix) {
            this.num[currentIndex] = integer[i];
            currentIndex -= 1;
          } else {
            this.num.splice(0,0,integer[i]);
          }

        }
      }

      currentIndex = currentIndexCopy + integer.length;
      for(var i = 0; i < fraction.length; i++) {

        if(exponent < 0){
          this.num.push(fraction[i]);
        } else {
          
          if(currentIndex < radix) {
            this.num[currentIndex] = fraction[i];
            currentIndex += 1;
          } else {
            this.num.push(fraction[i]);
          }
        }
      }

      // trim off leading zeros
      var loop = true;
      while(loop) {
        loop = false;
        if(this.num[0] == '0'){
          this.num.shift();
          loop = true;
        }
      }

      // trim off ending zeros (after radix)
      var loop = true;
      while(loop) {
        loop = false;
        if(this.num[this.num.length-1] == '0'){
          this.num.pop();
          loop = true;
        }
      }
    } else {
      this.num = new Array();
      this.num.push('.');
      this.sign = 1;
    }
  }

  // assign zero to a positive sign
  if(this.num.length == 1) {
    this.sign = 1;
  }
}


Long.prototype.toString = function() {
  var s = (this.sign > 0)? '+' : '-';
  return s + this.num.join("");
}

Long.prototype.setSign = function(s) {

  var a = this;

  s = +s;
  if(typeof s == "number" || s instanceof Number) {    
  
    if(s == 1 || s == -1) {
      a.sign = s;
    } else {
      a.sign = 1;
    }
  } else {
    a.sign = 1;
  }

  if(a.num.length == 1) {
    this.sign = 1;
  }
}

// returns 1,0,-1 if long b is <,=,> this
Long.prototype.compare = function(b) {

  var a = this;

  if(!(b instanceof Long)) {
    b = new Long(b);
  }

  // compare by sign
  if(a.sign > b.sign) {
    return 1;
  } else if(a.sign < b.sign) {
    return -1;
  }

  var aRadix = a.num.indexOf('.');
  var bRadix = b.num.indexOf('.');

  // compare by integer value
  if(aRadix > bRadix) {
    return 1;
  } else if(aRadix < bRadix) {
    return -1;
  }
  
  for(var i = 0; i < aRadix; i++) {
    var ai = a.num[i];
    var bi = b.num[i];

    if(ai > bi) {
      return 1;
    } else if(ai < bi) {
      return -1;
    }
  }

  // compare decimals
  var length = (a.num.length > b.num.length) ? a.num.length : b.num.length;
  length -= aRadix;

  for(var i = aRadix+1; i < length+1; i++) {
   
    if(i >= b.num.length) {      
      return (i < a.num.length)? 1 : 0;
    } else if( i >= a.num.length) {
      return (i < b.num.length)? -1 : 0;
    }

    var ad = a.num[i];
    var bd = b.num[i];

    if(ad > bd) {
      return 1;
    } else if(ad < bd) {
      return -1;
    }
  }

  return 0;
}


Long.prototype.add = function(b) {
 
  var a = this;

  if(!(b instanceof Long)) {
    b = new Long(b);
  }
  
  var aSign = a.sign;
  var bSign = b.sign
  
  var sign = (aSign == bSign)? 1 : -1;

  a.setSign(1);
  b.setSign(1);
    
  var maxNum = a;
  var minNum = b;

  if(a.compare(b) == -1) {
    maxNum = b;
    minNum = a;
  }

  var maxNumDecimalLength = maxNum.num.length - maxNum.num.indexOf('.');
  var minNumDecimalLength = minNum.num.length - minNum.num.indexOf('.');

  var decimalDifference = Math.abs(maxNumDecimalLength - minNumDecimalLength);
  
  var decimalMax = maxNum;
  if(minNumDecimalLength > maxNumDecimalLength) {
    decimalMax = minNum;
  }

  var carry = 0;
  var num = "";
  var maxIndex = maxNum.num.length - 1;
  var minIndex = minNum.num.length - 1;

  while(maxIndex >= 0 || minIndex >= 0 || carry != 0) {

    if(maxNum.num[maxIndex] != '.' || minNum.num[minIndex] != '.') {
        
      var i = 0;
      if(maxIndex >= 0 && (maxNum == decimalMax || decimalDifference == 0)) {
        i = +maxNum.num[maxIndex];
        maxIndex -= 1;
      }
    
      var j = 0;
      if(minIndex >= 0 && (minNum == decimalMax || decimalDifference == 0)) {
        j = +minNum.num[minIndex];
        minIndex -= 1;
        
      }

      if(decimalDifference > 0) {
        decimalDifference -= 1;
      }

      var k = i + sign * j + carry;
  
      carry = 0;
      if(k >= 10) {
        k -= 10;
        carry = 1;
      } else if(k < 0) {
        k += 10;
        carry = -1;
      }

      num = k + num;

    } else {
      num = '.' + num;
  
      maxIndex -= 1;
      minIndex -= 1;
    }
  }

  a.setSign(aSign);
  b.setSign(bSign);

  var s = (maxNum.sign < 0)? '-' : '+';
  num = s + num;

  return new Long(num);
}


Long.prototype.subtract = Long.prototype.sub = function(b) {
  
  var a = this;

  if(!(b instanceof Long)) {
    b = new Long(b);
  }

  var bSign = b.sign;
  b.setSign(b.sign * -1);

  var c = a.add(b); 
   
  b.setSign(bSign);
    
  return c;
}


Long.prototype.multiply = Long.prototype.mult = function(b) {

  var a = this;

  if(!(b instanceof Long)) {
    b = new Long(b);
  }

  var aRadix = a.num.indexOf('.');
  var bRadix = b.num.indexOf('.');

  var radixOffset = (a.num.length - 1 - aRadix) + (b.num.length - 1 - bRadix);

  var cList = new Array();

  var i = b.num.length - 1;

  var offsetCounter = 1;

  while(i >= 0){
    
    if(b.num[i] != '.') {
      if(+b.num[i] != 0) {
        var bi = b.num[i];
        
        var s = "" + Array(offsetCounter).join('0');

        var carry = 0;
        var j = a.num.length - 1;
        while(j >= 0 || carry != 0) {
      
          if(a.num[j] != '.') {
            var aj = 0;
            if(j >= 0) {
              aj = +a.num[j];
            }

            var m = bi * aj + carry;
            var q = Math.floor(m / 10);
            var r = m % 10;
          
            carry = q;

            s = r + s;
          }
          j -= 1;
        }

        // pad with zeros
        while(s.length - radixOffset < 0) {
          s = '0' + s;
        }
        
        // insert '.'
        s = s.slice(0, s.length - radixOffset) + '.' + s.slice(s.length - radixOffset);

        // add to array
        cList.push(new Long(s));
      }
      offsetCounter += 1;
    }

    i -= 1;
  }

  var c = new Long();

  for(var i = 0; i < cList.length; i++) {
    c = c.add(cList[i]);
  }

  c.setSign((a.sign == b.sign)? 1 : -1);

  return c;
}


Long.prototype.divide = Long.prototype.div = function(d, p) {

  var n = this;
  var nSign = n.sign;
  n.setSign(1);

  if(!(d instanceof Long)) {
    d = new Long(d);
  }

  var dSign = d.sign;
  d.setSign(1);

  // define precision if not given
  if(p === undefined) {
    p = 20;
  } else {
    p = +p;
  }

  if(d.compare(0) == 0 || n.compare(0) == 0) {

    n.setSign(nSign);
    d.setSign(dSign);

    return new Long();
  }

  var decimalIndex = n.num.indexOf('.');
  decimalIndex = (decimalIndex == 0)? 1 : decimalIndex; 

  while(n.compare(10) != -1) {
    n = n.multiply(.1);
  }

  while(d.compare(1) == -1) {
    d = d.multiply(10);
    decimalIndex += 1;
  }

  var s = "";

  var r = n;
  var i = 0;

  while(i < p && !(r.compare(0) == 0 && i > decimalIndex) ) {

    if(i == decimalIndex) {
      s = s + ".";
    }

    if(d.compare(r) < 1) {

      // find largest number that is still less than n
      var j = 9;
      var t = d;
      while(j > 0) {
        
        t = d.multiply(j);

        if(t.compare(r) < 1) {
          break;
        }

        j -= 1;
      }
     
      s = s + j;
      r = r.subtract(t);

    } else {
      s = s + "0";
    }

    d = d.multiply(.1);
    i += 1;
  }

  var c = new Long(s);
  var cSign = (nSign == dSign)? 1 : -1;

  n.setSign(nSign);
  d.setSign(dSign);
  c.setSign(cSign);
  
  return c;
}


Long.prototype.floor = function() {
  
  var a = this;
  var aSign = a.sign;
  a.setSign(1);

  var decimalIndex = a.num.indexOf('.');

  var s = "";
  for(var i = 0; i < decimalIndex; i++) {
    s = s + a.num[i];
  }

  var c = new Long(s);

  if(aSign == -1) {

    if(a.compare(c) != 0) {
      c = c.add(1);
    }

    c.setSign(-1);
  }

  a.setSign(aSign);

  return c;
}


Long.prototype.ceiling = function() {
  
  var a = this;
  var aSign = a.sign;
  a.setSign(1);

  var decimalIndex = a.num.indexOf('.');

  var s = "";
  for(var i = 0; i < decimalIndex; i++) {
    s = s + a.num[i];
  }

  var c = new Long(s);

  if(aSign == 1) {

    if(a.compare(c) != 0) {
      c = c.add(1);
    }
    
  } else {
    c.setSign(-1);
  }

  a.setSign(aSign);

  return c;
}


Long.prototype.modulus = Long.prototype.mod = function(b) {
  
  var n = this;
  
  if(!(b instanceof Long)) {
    b = new Long(b);
  }

  var bSign = b.sign;
  b.setSign(1);        // sign of base doesn't matter

  if(b.compare(0) == 0 || n.compare(0) == 0) {

    b.setSign(bSign);
    return new Long();
  }

  if(n.sign == -1) {
   
    // when n is negative
    // soln = b * ceiling(n / b) - n
    n.setSign(1);

    var r = b.multiply(n.divide(b).ceiling()).subtract(n);

    n.setSign(-1);
    b.setSign(bSign);
    
    return r;
  
  } else {
  
    // when n is positive
    // soln = n - b * floor(n / b)
    var r = n.subtract(b.multiply(n.divide(b).floor()));
  
    b.setSign(bSign);

    return r;
  }
}

// converts p to an integer
Long.prototype.power = Long.prototype.pow = function(p) {

  var a = this;

  var pow = new Long(p).floor();
  var powSign = pow.sign;
  pow.setSign(1);


  // when pow is zero return 1
  if(pow.compare(0) == 0) {
    return new Long(1);
  }

  var soln = new Long(a);
  while(pow.compare(1) != 0) {
    soln = soln.mult(a);
    pow = pow.sub(1);
  }
  
  if(powSign == -1) {
    return new Long(1).div(soln, 1000);
  } else {
    return soln;
  }
}


// root only takes integers
Long.prototype.root = function(r, p) {
 
  // define precision if not given
  if(p === undefined) {
    p = 50;
  } else {
    p = +p;
  }
  
  var root = new Long(r).floor();
  root.setSign(1);

  if(root.compare(0) == 0) {
    return new Long();
  }

  var soln = new Long(this);
  var nInverse = new Long(1).div(root, 1000);

  var delta = new Long(1);
  var error = new Long("1e-"+p);
  
  var i = 0;
  while(delta.compare(error) != -1) {

    var a = this.div(soln.pow(root.sub(1)), p * i);
    var delta = nInverse.mult(a.sub(soln));
 
    soln = soln.add(delta);

    delta.sign = 1;
    i += 1;
    
    console.log(delta.toString());
  
  }

  return soln;  
}


Long.prototype.factorial = function() {

  if(this.sign != 1) {
    return new Long(0);
  }

  var a = this.floor();
  var soln = new Long(1);

  while(a.compare(0) != 0) {
  
    soln = soln.mult(a);
    a = a.sub(1);
  }
  
  return soln;
}
