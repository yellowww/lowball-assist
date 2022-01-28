var ah = {
  allActiveAuctions:[],
  returned:undefined,
  loadStatus:{current:0,total:undefined}, 
  cbFunctions:{cb:undefined,update:undefined},
  requestAllAuctions: function(update,cb) {
    ah.loadStatus.current = 0;
    ah.returned = false;
    ah.loadStatus.total = Infinity;
    ah.cbFunctions.cb = cb;
    ah.cbFunctions.update = update;
    ah.doPage();
  },
  doPage:function() {
    ah.requestItemChunk(ah.loadStatus.current, function(sucsess) {
      if(sucsess) {
        ah.loadStatus.current++;
        if(ah.cbFunctions.update)ah.cbFunctions.update();
      }
      if(ah.loadStatus.current<ah.loadStatus.total) {
        setTimeout(ah.doPage,30);
      } else {
        if(!ah.returned) {
          ah.cbFunctions.cb();
          ah.returned = true;
        }
      }
    });
  },
  requestItemChunk: function(page,cb) {
    serverRequest.makeReq("https://api.hypixel.net/skyblock/auctions?page="+page, function(data,error) {
      if(error) {
        cb(false);
      } else {
        if(data!=undefined) {
          ah.loadStatus.total = data.totalPages;
          ah.allActiveAuctions = ah.allActiveAuctions.concat(data.auctions);
          cb(true);
        } else {
          cb(false);
        }

      }

    },true);
  },
  searchForBooks: function(querys) {
    var allBooks = [];
    var returnBooks = [];
    for(var i=0;i<this.allActiveAuctions.length;i++) {
      if(this.allActiveAuctions[i].item_name == "Enchanted Book" && this.allActiveAuctions[i].bin) {
        allBooks.push(this.allActiveAuctions[i]);
      }
    }
    for(var i=0;i<allBooks.length;i++) {
      var bookEnchant = enchants.checkIfIncludesEnchant(allBooks[i],querys);
      if(bookEnchant) {
        var indexToAdd = returnBooks.map(function(e) {
          return e.name;
        }).indexOf(bookEnchant.name);
        if(indexToAdd == -1) {
          returnBooks.push({name:bookEnchant.name,tier:bookEnchant.tier,allBooks:[allBooks[i]]});
        } else {
          returnBooks[indexToAdd].allBooks.push(allBooks[i]);
        }
      }
    }
    for(var i=0;i<returnBooks.length;i++) {
      var lb = ah.getLowestFromObj(returnBooks[i]);
      delete returnBooks[i].allBooks;
      returnBooks[i].lb  = lb;
    }
    return returnBooks;
  },
  getLowestFromObj: function(obj) {
    var min=Infinity,minI;
    for(var i=0;i<obj.allBooks.length;i++) {
      if(obj.allBooks[i].starting_bid<min) {
        min = obj.allBooks[i].starting_bid;
        minI = i;
      }
    }
    //console.log(minI,obj.allBooks)
    return obj.allBooks[minI];
  },
  searchForItem: function(name) {
    var allMatches = [];
    for(var i=0;i<ah.allActiveAuctions.length;i++) {
      var formatted = meta.reforge.removeReforge(meta.removeSpecialChars(ah.allActiveAuctions[i].item_name));
      if(formatted.clipped == name && ah.allActiveAuctions[i].bin) allMatches.push(ah.allActiveAuctions[i]);
    }
    var min=Infinity,minI;
    for(var i=0;i<allMatches.length;i++) {
      if(allMatches[i].starting_bid<min) {
        min=allMatches[i].starting_bid;
        minI=i;
      }
    }
    return allMatches[minI];
  },
  getRefCost: function(ref) {
    var index = meta.reforgeCosts.map(function(e) {
      return e.name;
    }).indexOf(ref);
    if(index == -1)return 0;
    return meta.reforgeCosts[index].cost;
  },
  getAuctionFromUUID(uuid,cb) {
    serverRequest.makeReq("https://api.hypixel.net/skyblock/auction?uuid="+uuid+"&key="+serverRequest.APIKey, data=> {
      cb(data.auctions);
    })
  }
}

var enchants = {
  checkIfIncludesEnchant: function(book,querys) {
    var allENames = querys.map(function(e){return e.enchant});
  //  console.log(allENames);
    for(var i=0;i<querys.length;i++) {
      var hasLinker = this.includesLinker(book.item_lore,querys[i].enchant);
      if(hasLinker) {
        var bookTier = enchants.getTier(book.item_lore,querys[i].enchant);
        if(bookTier == querys[i].value) return {name:querys[i].enchant,tier:querys[i].value};
      }
    }
    return false;
  },
  includesLinker: function(string, linker) {
    var allWords = linker.split(' ');
    if(linker == "Protection" && string.includes("Fire Protection")) return false;
    if(linker == "Protection" && string.includes("Projectile Protection")) return false;
    if(linker == "Protection" && string.includes("Blast Protection")) return false;
    if(linker == "Protection" && string.includes("True Protection")) return false;
    if(string.includes(linker)) return true;
    return false;
  },
  getTier: function(string,eName) {
    var split = string.split(eName+' ')[1];
    split = split.split("\n")[0];
    var tier = meta.numbers[meta.numerals.indexOf(split)];
    return tier;
  }
}

var bazaar = {
  data:{fuming:undefined,recomb:undefined},
  getBzData: function() {
    serverRequest.makeReq("https://api.hypixel.net/skyblock/bazaar", function(data) {
      bazaar.data.fuming = data.products.FUMING_POTATO_BOOK.quick_status.buyPrice;
      bazaar.data.recomb = data.products.RECOMBOBULATOR_3000.quick_status.buyPrice;
    })
  }
}


var similarItems = {
  findAllItems: function(name,cb) {
    
    var allMatches = [];
    for(var i=0;i<ah.allActiveAuctions.length;i++) {
      var formatted = meta.reforge.removeReforge(meta.removeSpecialChars(ah.allActiveAuctions[i].item_name));
      if(formatted.clipped == name && ah.allActiveAuctions[i].bin) allMatches.push(ah.allActiveAuctions[i]);
    }
    processData.alowedPercent = 1-(1/(allMatches.length/15));
    if(processData.alowedPercent<0.2)processData.alowedPercent = 0.2;
    if(processData.alowedPercent>0.945)processData.alowedPercent = 0.945;
    var allScores = [],numOfSubmitted = 0;
    for(var i=0;i<allMatches.length;i++) {
      this.generateScore(allMatches[i], function(cbData) {
        allScores.push(cbData);
        numOfSubmitted++;
        if(numOfSubmitted == allMatches.length) {
          var scoreArray = allScores.map(function(e) {return e.score;})
          var maxScore = Math.max(...scoreArray);
          for(var j=0;j<allScores.length;j++) {
           if(allScores[j].score>(maxScore*(1-processData.alowedPercent)))  {
             allScores.splice(j,1);
             j--;
           }
          }
          allScores.sort(function(a,b) {
            return a.auction.starting_bid-b.auction.starting_bid;
          });
          if(allScores.length>20) {
            allScores.splice(19,allScores.length-20);
          }
          cb(allScores)
        }
      });
    }
  },
  getItemDataFromString(string,cb) {
    serverRequest.decodeData(string, function(decoded) {
      cb(serverRequest.parseDecoded(decoded))
    })
  },
  generateScore: function(auction,cb) {
    similarItems.getItemDataFromString(auction.item_bytes, function(parsedData) {
      parsedData = parsedData[0];
      var differences = [];
      var fumCost = parsedData.fumingPotatoBooks*bazaar.data.fuming;
      fumCost=Math.round(processData.itemCosts.fuming-fumCost);
      if(fumCost<0)fumCost=0;
      if(fumCost>0)differences.push((processData.selectedItem.fumingPotatoBooks-parsedData.fumingPotatoBooks)+" fewer fuming potato books | "+meta.cleanUpNumber(Math.round(-1*fumCost)))
      var recombCost = 0;
      if(!parsedData.rarityUpgraded && processData.selectedItem.rarityUpgraded && processData.itemCosts.reforge != undefined) {
        recombCost = Math.round(bazaar.data.recomb);
        differences.push("not recombed |"+(meta.cleanUpNumber(-1*recombCost)));
      }
      var refCost = 0;
      if(parsedData.reforge != processData.selectedItem.reforge) { 
        
        
        if(processData.itemCosts.reforge == undefined) {
          differences.push("does not have reforge "+processData.selectedItem.reforge+" | Not enough data");
        } else {
          differences.push("does not have reforge "+processData.selectedItem.reforge+" | "+meta.cleanUpNumber(-1*processData.itemCosts.reforge));
          refCost = processData.itemCosts.reforge;
        }
      }
      var enchantCost = 0;
      for(var i=0;i<processData.itemCosts.enchants.length;i++) {
        var hasEnchant = parsedData.enchants.map(function(e) {
          return e.enchant+e.value;
        }).includes(processData.itemCosts.enchants[i].name+processData.itemCosts.enchants[i].tier);
        if(!hasEnchant) {
          enchantCost+=processData.itemCosts.enchants[i].lb.starting_bid;
          differences.push("does not have enchant "+processData.itemCosts.enchants[i].name+" "+processData.itemCosts.enchants[i].tier+" | "+meta.cleanUpNumber(-1*processData.itemCosts.enchants[i].lb.starting_bid));
        }
      }
      cb({score: fumCost+recombCost+refCost+enchantCost, differences:differences, auction:auction});
    });
  }
}