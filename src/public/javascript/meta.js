var meta = {
  stats: [ "Strength", "Crit Damage", "Damage", "Crit Chance", "Bonus Attack Speed", "Intelligence", "Health", "Defence", "True Protection", "Mining Speed", "Speed",  "Sea Creature Chance", "Magic Find", "Pet Luck", "Ferocity", "Ability Damage", "Mining Fortune", "Farming Fortune", "Foraging Fortune", "Pristine"],
  statExps:["traps may increase your", "grant", "Ability:", "grants", "cooldown", "Grants", "Grant", "gain", "Gain"],

  enchants: ["Angler", "Big Brain", "Caster", "Compact", "Cubism", "Depth Strider", "Efficiency", "Experience", "Fire Aspect", "Flame", "Frost Walker", "Harvesting", "Infinite Quiver", "Life Steal", "Luck of the Sea", "Magnet", "Power", "Rejuvenate", "Respite", "Silk Touch", "Smite", "Sugar Rush", "Thorns", "Titan Killer",
  "Turbo-Wheat", "Turbo-Carrot", "Turbo-Potato", "Turbo-Pumpkin", "Turbo-Melon", "Turbo-Mushrooms", "Turbo-Cocoa", "Turbo-Cactus", "Turbo-Cane", "Turbo-Warts", "Vicious", "Aqua Affinity", "Bane of Arthropods", "Blessing", "Cleave", "Critical", "Delicate", "Aiming", "Execute", "Feather Falling", "First Strike", "Frail", "Growth",
  "Impaling", "Lethality", "Luck", "Mana Steal", "Piercing", "Prosecute", "Rainbow", "Respiration", "Sharpness", "Smarty Pants", "Spiked Hook", "Telekinesis", "Thunderloard", "Protection", "True Protection", "Venomous", "Blast Protection", "Chance", "Counter-Strike", "Cultivating", "Dragon Hunter", "Ender Slayer", "Expertise", "Fire Protection",
  "Fortune", "Giant Killer", "Pristine", "Knockback", "Looting", "Lure", "Overload", "Projectile Protection", "Punch", "Replenish", "Scavenger", "Smelting Touch", "Snipe", "Syphon", "Thunderbolt", "Triple-Strike", "Vampirism", "Bank", "Chimera", "Combo", "Last Stand", "Legion", "No Pain No Gain", "One For All", "Rend", "Soul Eater",
  "Swarm", "Ultimate Jerry", "Ultimate Wise", "Wisdom"],

  allReforges: ["Gentle", "Odd", "Fast", "Fair", "Epic", "Sharp", "Heroic", "Spicy", "Legendary", "Deadly", "Fine", "Grand", "Hasty", "Neat", "Rapid", "Unreal", "Awkward", "Rich", "Clean", "Fierce", "Heavy", "Light", "Mythic", "Pure", "Smart", "Titanic", "Wise", "Candied", "Bizarre", "Itchy", "Ominous", "Pleasant", "Pretty",
  "Shiny", "Simple", "Strange", "Vivid", "Godly", "Demonic", "Forceful", "Hurtful", "Keen", "Strong", "Superior", "Unpleasant", "Zealous", "Moil", "Toil", "Blessed", "Bountiful", "Magnetic", "Fruitful", "Refined", "Stellar", "Mithraic", "Auspicious", "Fleet", "Heated", "Ambered", "Dirty", "Fabled",
  "Suspicious", "Gilded", "Warped", "Withered", "Bulky", "Salty", "Treacherous", "Stiff", "Lucky", "Precise", "Spiritual", "Headstrong", "Perfect", "Necrotic", "Ancient", "Spiked", "Renowned", "Cubic", "Reinforced", "Loving", "Ridiculous", "Empowered", "Giant", "Submerged", "Jaded", "Silky", "Bloody",
  "Shaded", "Sweet", "Undead"],
  reforgeCosts: [{name:"Fabled",cost:2000000},{name:"Suspicious",cost:1000000},{name:"Guilded",cost:5000000}, {name:"Warped", cost:10000000}, {name:"Withered", cost:2000000}, {name:"Lucky", cost:1000000}, {name:"Precise", cost:500000}, {name:"Spiritual", cost:3000000},{name:"Renowned", cost:10000000}, {name:"Giant", cost:1500000},
                 {name:"Submerged", cost:9000000}, {name:"Jaded",cost:5000000},{name:"Blessed",cost:1000000},{name:"Toil",cost:1000000},{name:"Bountiful",cost:2000000}, {name:"Refined",cost:1000000}, {name:"Auspicious",cost:2500000}, {name:"Fleet",cost:2000000},{name:"Ambered",cost:3000000}, {name:"Treacherous", cost:1000000}],

  numerals:['I',"II","III","IV","V","VI","VII","VIII","IX","X"],
  numbers: [1,2,3,4,5,6,7,8,9,10],
  rarities:["COMMON","UNCOMMON","RARE","EPIC","LEGENDARY","MYTHIC","SUPREME","SPECIAL","VERY SPECIAL"],

  checkIfIncludesStat: function(stat) {
    if(meta.checkForRarities(stat,meta.statExps)) {
      return 0;
    }
    if(!stat.includes("+") && !stat.includes("-")) return 0;
    var stopLoop = false;
    for(var i=0;i<meta.stats.length;i++) {
      if(stat.includes(meta.stats[i])){
        if(!stopLoop) {
          stopLoop = true;
          return meta.stats[i];
        }
      } 
    }
    return 0;
  },
  getHotPotatoBooks: function(stat) {
    if(!stat.includes("ÃÂÃÂÃÂÃÂ§e")) return [0,0];
    var splitStat = stat.split("ÃÂÃÂÃÂÃÂ§e")[1];
    splitStat = splitStat.split(")")[0];
    splitStat = splitStat.split("(+")[1];
    splitStat = Number(splitStat);
    var returnVal = [splitStat/2, (splitStat/2)-10];
    if(returnVal[1]<0) returnVal[1]=0;
    if(returnVal[0]>10) returnVal[0]=10;
    return returnVal;
  },
  removeNonNumbers: function(string) {
    var numbers = ["-","0","1","2","3","4","5","6","7","8","9"];
    string = string.split('');
    for(var i=0;i<string.length;i++) {
     if(!numbers.includes(string[i].toString())) {string.splice(i,1);i--;}
    }
    return string.join('');
  },
  checkForEnchants: function(stat) {
    var enchantList = [];
    for(var i=0;i<meta.enchants.length;i++) {
      if(stat.includes(meta.enchants[i])) {
        var startingIndex = meta.findAllIndices(stat, meta.enchants[i]);
        var newString = stat.slice(startingIndex[0],stat.length-1);
        newString = newString.split("Ã")[0];
        newString = meta.removeSpecialChars(newString)
        newString+='|';
        if(meta.checkIfStringIncludesArrayEntry(newString, meta.numerals)) {
          var enchant = meta.seperateNumeral(newString);
          enchantList.push(enchant);
        }

      };
    }
    if(enchantList.length>0) {
      return enchantList;
    } else {
      return false
    }
  },
  getNameAndRarity: function(stat) {
    if(stat.includes("Name")) {
      var isArmor = meta.checkIfArmor(stat);
      var clipped = stat.split("Name")[1];
      clipped = meta.removeSpecialChars(clipped.slice(19,clipped.length-1).split('Ã')[0]);
      reforge = meta.reforge.removeReforge(clipped);
      clipped = reforge.clipped;
      var stars = stat.split("Name")[1];
      var startingIndex = stars.indexOf(clipped);
      stars = stars.substring(startingIndex+clipped.length);
      stars = stars.replace(/[^ª]/g, "").length;
      if(clipped[clipped.length-1] == ' ') {
        clipped = clipped.split('');
        clipped.pop();
        clipped = clipped.join('');
      }
      rarityUpgraded = stat.split("Name")[0].includes("§ka");
      var rarity = meta.checkForRarities(stat,meta.rarities);
      if(rarity) {
        return {name:clipped,rarity:rarity,rarityUpgraded:rarityUpgraded,stars:stars,reforge:reforge.ref,armor:isArmor};
      } else {
        return {name:clipped,rarity:undefined,rarityUpgraded:undefined,stars:stars,reforge:reforge.ref,armor:isArmor};
      }

    }
    return 0;
  },
  checkIfArmor: function(stat) {
    if(stat.includes("Chestplate")) return true;
    if(stat.includes("Leggings")) return true;
    if(stat.includes("Helmet")) return true;
    if(stat.includes("Boots")) return true;
    if(stat.includes("Jacket")) return true;
    if(stat.includes("Pants")) return true;
    if(stat.includes("Oxfords")) return true;
    return false;
  },
  removeSpecialChars: function(str) {
    var keepChars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v','w', 'x', 'y', 'z', ' ', '-']
    var newStr = str.split('');
    for(var i=0;i<newStr.length;i++) {
      if(!keepChars.includes(newStr[i].toLowerCase())) {
        newStr.splice(i,1);
        i--;
      }
    }
    return newStr.join('');
  },
  seperateNumeral: function(str) {
    var numeral = meta.checkIfStringIncludesArrayEntry(str, meta.numerals);
    var value = meta.numbers[meta.numerals.indexOf(numeral)];
    return {enchant:str.split(' '+numeral)[0], value};
  },
  checkIfStringIncludesArrayEntry:function(str,arr) {
    for(var i=0;i<arr.length;i++) {
      if(str.includes(' '+arr[i]+'|')) return arr[i];
    }
    return false;
  },
  checkForRarities:function(str,arr) {
    for(var i=0;i<arr.length;i++) {
      if(str.includes(arr[i])) return arr[i];
    }
    return false;
  },
  findAllIndices: function(str, keyword) {
    var regex = new RegExp(keyword, "gi"), result, indices = [];
    while ( (result = regex.exec(str)) ) {
      indices.push(result.index);
    }
    return indices;
  },
  reforge: {
    removeReforge: function(str) {
      var newStr,reforge=undefined;
      if(str.includes('Very ') || str.includes("Absolutly ") || str.includes("Even More ") && !str.includes('Very Special')) {
        if(str.includes('Very ')) {
          newStr = str.split("Very ")[1];
        } else if(str.includes("Absolutly ")){
          newStr = str.split("Absolutly ")[1];
        } else {
          newStr = str.split("Even More ")[1]
        }
        reforge = newStr.split(' ')[0];
      } else {
        reforge = meta.reforge.checkAllReforges(str);
        if(reforge != false) {
          newStr = str.replace(reforge+" ", "")
        } else {
          newStr = str;
        }
      }
      if(newStr[newStr.length-1] == ' ') {
        newStr = newStr.split('');
        newStr.pop();
        newStr = newStr.join('');
      }
      if(reforge == false) reforge = undefined;
      return {clipped:newStr,ref:reforge};
    },
    checkAllReforges: function(str) {
      for(var i=0;i<meta.allReforges.length;i++) {
        if(str.includes(meta.allReforges[i]+" ")) {
          if(this.checkContra(str, meta.allReforges[i]))  return meta.allReforges[i];
        }
      }
      return false;
    },
    checkContra: function(str, ref) {
      if(str.includes("Wise Dragon") && ref == "Wise") {
        return false;
      }
      if(str.includes("Suspicious Vial") && ref == "Suspicious") {
        return false;
      }
      if(str.includes("Strong Dragon") && ref == "Strong") {
        return false;
      }
      if(str.includes("Perfect Chestplate") && ref == "Perfect") {
        return false;
      }
      if(str.includes("Superior Dragon") && ref == "Superior") {
        return false;
      }
      if(str.includes("Perfect Leggings") && ref == "Perfect") {
        return false;
      }
      if(str.includes("Perfect Helmet") && ref == "Perfect") {
        return false;
      }
      if(str.includes("Perfect Boots") && ref == "Perfect") {
        return false;
      }
      if(str.includes("Super Heavy") && ref == "Heavy") {
        return false;
      }
      if(str.includes("Heavy Helmet") && ref == "Heavy") {
        return false;
      }
      if(str.includes("Heavy Chestplate") && ref == "Heavy") {
        return false;
      }
      if(str.includes("Heavy Leggings") && ref == "Heavy") {
        return false;
      }
      if(str.includes("Heavy Boots") && ref == "Heavy") {
        return false;
      }
      if(str.includes("Refined Titanium Pickaxe") && ref == "Refined") {
        return false;
      }
      return true;
    }
  },
  cleanUpNumber: function(number) {
    if(typeof number == "string") return number;
    var split=number.toString().split('');
    var n=0;
    for(var i=split.length-1;i>=1;i--) {
      if(n%3==2 && split[i-1] != "-") split.splice(i, 0, "," );
      n++;
    }
    return split.join('');
  }
}
