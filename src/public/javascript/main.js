var eventInitiaters = {
    initiateAPIKey: function(e) {
        if(e.keyCode == 13) {
            var key = document.getElementById("apiInput").value;
            localStorage.apiKey = key;
            serverRequest.APIKey = key;
            document.getElementById("usernameContainer").style.display = "block";
            document.getElementById("apiKeyContainer").style.display = "none";
        }
    },
    initiateUsername: function(e) {
        if(e.keyCode == 13) {
            var username = document.getElementById("usernameInput").value;
            abstractedRequests.initiateProfileSelection(username);
        }
    },
    initiateProfile: function(e) {
        if(e.keyCode == 13) {
            var profile = document.getElementById("profileInput").value;
            profile = profile.split('');
            profile[0] = profile[0].toUpperCase();
            profile = profile.join('');
            abstractedRequests.initiateItemSelection(profile);
        }
    },
    initiateAuction: function(e) {
        if(e.keyCode == 13) {
            document.getElementById("usernameContainer").style.display = "none";
            var uuid = document.getElementById("uuidInput").value;
            if(uuid.includes("/viewauction")) uuid = uuid.split("/viewauction ")[1];
            uuid = uuid.replace(/-/g,'');
            ah.getAuctionFromUUID(uuid, auction => {
                serverRequest.decodeData(auction[0].item_bytes.data, decoded => {
                    var parsed = serverRequest.parseDecoded(decoded);
                    processData.allItemData = parsed;
                    processData.openItem(0);
                });
            });
        }
    },
    copyText: function(text) {
        const elem = document.createElement('textarea');
        elem.value = text;
        document.body.appendChild(elem);
        elem.select();
        document.execCommand('copy');
        document.body.removeChild(elem);
    }
}

var abstractedRequests = {
    currentUsername:undefined,
    initiateProfileSelection: function(name) {
        this.currentUsername = name;
        document.getElementById("profileInput").value = "Loading..."
        serverRequest.getCurrentProfile(name, profileName=>{
            document.getElementById("profileInput").value = profileName;
        });
        document.getElementById("usernameContainer").style.display = "none";
        document.getElementById("profileContainer").style.display = "block";
        document.getElementById("profileInput").focus();
    },
    initiateItemSelection: function(profile) {
        document.getElementById("profileContainer").style.display = "none";
        document.getElementById("itemNameContainer").innerHTML = "Loading..."
        serverRequest.reqInvFromProfile(this.currentUsername,profile, function(data) {
            serverRequest.decodeData(data.inv_contents.data, function(decoded) {
                var parsedData = serverRequest.parseDecoded(decoded);
                processData.allItemData = parsedData;
                var container = document.getElementById("itemNameContainer");
                container.innerHTML = "";
                for(var i=0;i<parsedData.length;i++) {
                    container.appendChild(UI.createNewItemName(i));
                }
            });
        })
    },
}

var processData = {
    allItemData:undefined,
    selectedItem:undefined,
    rawItemValue:undefined,
    itemCosts:undefined,
    currentMarkdown:0.8,
    similarLowballPrice:undefined,
    alowedPercent:0.85,
    loadLocalStorage: function() {
        var lsMarkdown = localStorage.markdown;
        if(!lsMarkdown) {
            localStorage.markdown = 0.8;
        }
        this.currentMarkdown = localStorage.markdown;
        document.getElementById("markdownInput").value = (1-this.currentMarkdown)*100;
        UI.updateMarkdownDisplay();

        var lsAPI = localStorage.apiKey;
        if(!lsAPI) {
            document.getElementById("usernameContainer").style.display = "none";
            document.getElementById("apiKeyContainer").style.display = "block";
        } else {
            serverRequest.APIKey = lsAPI;
        }
    },
    openItem: function(index) {
        this.selectedItem = this.allItemData[index];
        document.getElementById("detailStatus").style.display = "block";
        document.getElementById("itemNameContainer").innerHTML = "";
        var startTime = new Date();startTime = startTime.getTime();
        ah.requestAllAuctions(function() {
            var perDone = (ah.loadStatus.current/ah.loadStatus.total)*100;
            var currentTime = new Date();currentTime = currentTime.getTime();
            var timePerPercent = (currentTime-startTime)/perDone
            var remainingTime = (100-(ah.loadStatus.current/ah.loadStatus.total)*100)*timePerPercent;
            var formated = "Scanning Auction House...<br>Time remaining: "+(Math.round(remainingTime/100)/10)+" seconds";
            document.getElementById("detailStatus").innerHTML = formated
        }, function() {
            document.getElementById("viewItemDetails").style.display = "inline-block";
            document.getElementById("similarContainer").style.display = "inline-block";             
            document.getElementById("detailStatus").style.display = "none";
            processData.itemCosts = {item:undefined,reforge:undefined,enchants:undefined,fuming:undefined,recomb:undefined};
            var allBooks = ah.searchForBooks(processData.selectedItem.enchants);
            processData.rawItemValue = 0;
            UI.itemDetails.enchants.show(allBooks);
            UI.itemDetails.showItemValue();
            UI.itemDetails.showRefCost();
            UI.itemDetails.showOtherStats();
            UI.itemDetails.showEndingCosts();
            UI.addSimilarItems();
            UI.updatePrices();
            document.getElementById("markdownInputContainer").style.display = "block";
        });
    }
}

var UI = {
    createNewItemName(index) {
        var e = document.createElement("div");
        e.innerHTML = processData.allItemData[index].name;
        e.classList.add("itemNameMenu");
        e.onclick = function() {processData.openItem(index)};
        return e;
    },
    updateMarkdownDisplay: function() {
        var markdown = Number(document.getElementById("markdownInput").value);
        var display = markdown;
        if(display<10)display = "0"+display;
        document.getElementById("markdownInputDisplay").innerHTML = display+"% price markdown";
        localStorage.markdown = 1-(markdown/100);
        processData.currentMarkdown = 1-(markdown/100);
        UI.updatePrices();
    },
    updatePrices: function() {
        document.getElementById("lowballCost").innerHTML = "Lowball Price: "+meta.cleanUpNumber(Math.round((processData.rawItemValue*0.85)*processData.currentMarkdown))+" <div class='smallText'>Lowball price you should buy the item at</div>";
        document.getElementById("similarLowballCost").innerHTML = "Lowball Price: "+meta.cleanUpNumber(Math.round((processData.similarLowballPrice)*processData.currentMarkdown))+" <div class='smallText'>Lowball price you should buy the item at</div>";
    },
    itemDetails: {
        showEndingCosts: function() {
            document.getElementById("totalCost").innerHTML = "Total raw item cost: "+meta.cleanUpNumber(Math.round(processData.rawItemValue));
            document.getElementById("totalAHCost").innerHTML = "Estimated AH price: "+meta.cleanUpNumber(Math.round(processData.rawItemValue*0.85))+" <div class='smallText'>85% of raw cost</div>";
        },
        showItemValue: function() {
            var itemLB = ah.searchForItem(processData.selectedItem.name);
            var e = document.getElementById("itemValue");
            e.innerHTML = processData.selectedItem.name+": "+meta.cleanUpNumber(itemLB.starting_bid);
            processData.rawItemValue+=itemLB.starting_bid;
            processData.itemCosts.item = itemLB.starting_bid;
            e.title = "click to copy viewauction command";
            e.style.cursor = "pointer";
            e.onclick = function() {
                eventInitiaters.copyText("/viewauction "+itemLB.uuid);
            }
        },
        showRefCost: function() {
            var cost = ah.getRefCost(processData.selectedItem.reforge);
            if(cost != 0) {
                var e = document.getElementById("refValue");
                e.innerHTML = "Reforge Value ("+processData.selectedItem.reforge+"): "+meta.cleanUpNumber(cost);
                processData.rawItemValue+=cost;
                processData.itemCosts.reforge = cost;
            }
        },
        showOtherStats: function() {
            if(processData.selectedItem.rarityUpgraded) {
                document.getElementById("recValue").innerHTML = "Recomb Value: "+meta.cleanUpNumber(Math.round(bazaar.data.recomb));
                processData.rawItemValue+=Math.round(bazaar.data.recomb);
                processData.itemCosts.recomb = Math.round(bazaar.data.recomb);
            } else {
                processData.itemCosts.recomb = 0;
            }
            if(processData.selectedItem.fumingPotatoBooks>0){
                document.getElementById("fumValue").innerHTML = "Fuming Potato Book Value: "+meta.cleanUpNumber(Math.round(bazaar.data.fuming*processData.selectedItem.fumingPotatoBooks));
                processData.rawItemValue+=Math.round(bazaar.data.fuming*processData.selectedItem.fumingPotatoBooks);
                processData.itemCosts.fuming = Math.round(bazaar.data.fuming*processData.selectedItem.fumingPotatoBooks);
            } else {
                processData.itemCosts.fuming = 0;
            }
        },
        enchants: {
            show: function(enchantData) {
                var container = document.getElementById("allEnchants"),cmlVal=0;
                for(var i=0;i<enchantData.length;i++) {
                    var ele = this.createE(enchantData[i]);
                    if(enchantData[i].name == "Telekinesis") {
                        cmlVal+=100
                    } else if(enchantData[i].name == "Fire Aspect" && enchantData[i].lb.starting_bid>50000){
                        cmlVal+=50000
                    } else {
                        cmlVal+=enchantData[i].lb.starting_bid;
                    }   
                    container.appendChild(ele);
                }
                processData.itemCosts.enchants = enchantData;
                document.getElementById("enchantValue").innerHTML = "Enchant Value: "+meta.cleanUpNumber(cmlVal);
                processData.rawItemValue+=cmlVal;
            },
            createE: function(data) {
                var newE = document.createElement("div");
                
                newE.classList.add("enchantDetail");
                if(data.name == "Telekinesis") {
                    newE.innerHTML = data.name+" "+data.tier+" - 100";
                    newE.style.cursor = "default";
                } else if(data.name == "Fire Aspect" && data.lb.starting_bid>50000) {
                    newE.innerHTML = data.name+" "+data.tier+" - 50,000";
                    newE.style.cursor = "default";
                } else {
                    newE.innerHTML = data.name+" "+data.tier+" - "+meta.cleanUpNumber(data.lb.starting_bid);
                    newE.title = "click to copy viewauction command"
                    newE.onclick = function() {
                        eventInitiaters.copyText("/viewauction "+data.lb.uuid);
                    }
                }

                return newE;
            }
        }        
    },
    addSimilarItems: function() {
        var getSimilarItems = similarItems.findAllItems(processData.selectedItem.name, data => {
            var container = document.getElementById("allSimilarItems");
            for(var i=0;i<data.length;i++) {
                container.appendChild(UI.newSimilarDiv(data[i]));
            }
            var averageAmount = data.length;
            if(averageAmount>4)averageAmount=4;
            processData.similarLowballPrice = 0;
            var averageScore = 0;
            for(var i=0;i<averageAmount;i++) {
                processData.similarLowballPrice+=data[i].auction.starting_bid;
                averageScore+=data[i].score;
            }
            averageScore/=averageAmount;
            
            processData.similarLowballPrice/=averageAmount;
            if(averageScore>processData.similarLowballPrice*0.4 || isNaN(processData.similarLowballPrice)) {
                document.getElementById("unreliableDisclaimer").style.display="block";
                document.getElementById("similarLowballCost").style.display="none";
            } else {
                document.getElementById("similarSellPrice").innerHTML = "Sell item for: "+meta.cleanUpNumber(Math.round(processData.similarLowballPrice));
            }
        });
    },
    newSimilarDiv: function(data) {
        var container = document.createElement("div");
        container.classList.add("similarContainer");
        var newE = document.createElement("div");
        newE.classList.add("similarTitle");
        newE.innerHTML = data.auction.item_name;
        newE.title = "Click to copy viewauction command";
        newE.onclick = function() {
            eventInitiaters.copyText("/viewauction "+data.auction.uuid);
        }
        container.appendChild(newE);
        newE = document.createElement("div");
        newE.classList.add("similarPrice");
        newE.innerHTML = "Price: "+meta.cleanUpNumber(data.auction.starting_bid);
        container.appendChild(newE);
        if(data.differences.length>0) {
            data.differences.splice(0,0,"Negitive differences:<br>");
        } else {
            data.differences.push("No negitive differences");
        }
        
        var differences = document.createElement("div");
        for(var i=0;i<data.differences.length;i++) {
            var newDif = document.createElement("div");
            newDif.classList.add("itemDifference");
            newDif.innerHTML = data.differences[i];
            differences.appendChild(newDif);
        }
        container.appendChild(differences);
        return container;
    }


}


window.onload = function() {
    processData.loadLocalStorage();
    bazaar.getBzData();
    document.getElementById("apiInput").onkeydown = eventInitiaters.initiateAPIKey;
    document.getElementById("usernameInput").onkeydown = eventInitiaters.initiateUsername;
    document.getElementById("profileInput").onkeydown = eventInitiaters.initiateProfile;
    document.getElementById("uuidInput").onkeydown = eventInitiaters.initiateAuction;
}
