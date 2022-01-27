var serverRequest = {
  APIKey: undefined,

  makeReq: function(request, callBack,errorCheck) {
    fetch(request)
      .then(response => {
        if(response.ok) {
          return response.json()
        } else {
          if(errorCheck)callBack(undefined,true);
        }
        
      })
      .catch(error => {
        console.log(error)
        document.body.innerHTML = "Network error: "+error;
        if(errorCheck) {callBack(undefined,true)}else
        {return "error"}
      })
      .then(data => {
          callBack(data,false);
      });
  },
  reqInvFromProfile: function(userName,cuteName,callback) {
    var saveUUID;
    serverRequest.makeReq("https://api.ashcon.app/mojang/v2/user/"+userName, function(uuid) {
      saveUUID = uuid;
      serverRequest.makeReq("https://api.hypixel.net/player?key="+serverRequest.APIKey+"&uuid="+uuid.uuid, function(profile) {
        var profObj = profile.player.stats.SkyBlock.profiles;
        var profileID=profObj[serverRequest.getNameFromProp(profObj,"cute_name",cuteName)]
        serverRequest.makeReq("https://api.hypixel.net/skyblock/profile?key="+serverRequest.APIKey+"&profile="+profileID.profile_id, function(data) {
          callback(data.profile.members[saveUUID.uuid.replace(/-/g,"")])
        })
      });
    });
  },
  getCurrentProfile: function(userName, cb) {
    var saveUUID;
    serverRequest.makeReq("https://sky.shiiyu.moe/api/v2/profile/"+userName, data=> {
      var profNames = Object.keys(data.profiles);
      var profileLastSave = [];
      for(var i=0;i<profNames.length;i++) {
        profileLastSave.push(data.profiles[profNames[i]].last_save);
      }
      var max=-Infinity,maxI;
      for(var i=0;i<profileLastSave.length;i++) {
        if(profileLastSave[i]>max) {
          max = profileLastSave[i];
          maxI = i;
        }
      }
      cb(data.profiles[profNames[maxI]].cute_name);
    })
  }, 
  getNameFromProp: function(obj,prop,value) {
    var array = Object.keys(obj);
    for(var i=0;i<array.length;i++) {
      if(obj[array[i]][prop]== value) return array[i];
    }
    return null;
  },
  decodeData: function(string, callback) {
    var data = buffer.Buffer.from(string, 'base64');
    data = pako.inflate(data);
    var strData = String.fromCharCode.apply(null, new Uint16Array(data));
    callback(strData)
  },
  parseDecoded: function(stringData) {
    var splitData = stringData.split('id');
    allItems = [];
    for(var i=1;i<splitData.length;i++) {
      var thisItem = splitData[i];
      var isArmor=false,aHBPs,wHBPs;
      var noteWorthyProps = {stats:[],enchants:[],name:undefined,rarity:undefined,rarityUpgraded:undefined,stars:undefined,reforge:undefined,hotPotatoBooks:undefined,fumingPotatoBooks:undefined};
      var stats = serverRequest.getAccString(thisItem, 'utf8').split("Lore")[1];
      stats = serverRequest.getAccString(stats, 'utf8').split("ExtraAttributes")[0];
      stats = stats.split("Â§7");
      for(var n=0;n<stats.length;n++) {
        var thisStat = serverRequest.getAccString(stats[n], 'utf8');
        var enchants = meta.checkForEnchants(thisStat);
        var itemName = meta.getNameAndRarity(thisStat);
        if(itemName) {
          noteWorthyProps.name=itemName.name;
          noteWorthyProps.rarity=itemName.rarity;
          noteWorthyProps.rarityUpgraded=itemName.rarityUpgraded;
          noteWorthyProps.stars=itemName.stars;
          noteWorthyProps.reforge=itemName.reforge;
          isArmor = itemName.armor;
        }
        if(enchants)noteWorthyProps.enchants=enchants;
        var isStat = meta.checkIfIncludesStat(thisStat);
        if(isStat) {
          if(thisStat.includes('+')) {
            var accStat = thisStat.split('+')[1].split('Ã')[0];
          } else {
            if(thisStat.includes("-")) var accStat = thisStat.split('-')[1].split('Ã')[0];
          }
          if(isStat == "Damage") {
            wHBPs = meta.getHotPotatoBooks(thisStat);
          }
          if(isStat =="Health") {
            aHBPs = meta.getHotPotatoBooks(thisStat);
          }
           
          accStat = meta.removeNonNumbers(accStat);
          noteWorthyProps.stats.push({stat:isStat, value:Number(accStat)});
        }
      }
      if(isArmor) {
        if(aHBPs) {
          noteWorthyProps.hotPotatoBooks = aHBPs[0];
          noteWorthyProps.fumingPotatoBooks = (aHBPs[1]-10)/2;          
        }
      } else {
        if(wHBPs) {
          noteWorthyProps.hotPotatoBooks = wHBPs[0];
          noteWorthyProps.fumingPotatoBooks = wHBPs[1]/2;          
        }

      }
      allItems.push(noteWorthyProps);
    //  console.log(thisItem)
    }
    return allItems

  },
  getAccString: function(encodedString, encode) {
    var buff = buffer.Buffer.from(encodedString, encode)
    return String.fromCharCode.apply(null, new Uint16Array(buff));
  }
}

/*window.onload = function() {
  serverRequest.reqInvFromProfile("amyellow","Grapes", function(data) {
  //  console.log(data.inv_contents.data);
    serverRequest.decodeData(data.inv_contents.data, function(decoded) {
      serverRequest.parseDecoded(decoded);
    })
  })
}*/
