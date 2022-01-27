# lowball-assist
### An open source program for hypixel skyblock to help you lowball items

#### Currently hosted [here](https://www.mashedpotatoes777.com/web_projects/hypixelSkyblock/lowball-assist/home.html)

##

## This program was developed to help you find an acurate price for an item quickly.

### Searching for an item
> You will need to input your API key to resolve some connections to the hypixel api, otherwise this program can not function.

You can either search for an item in a players inventory or a item on the auction house.

To get an item from a players inventory, simpily specify their username.

To get an item from the auction house, you need to find the uuid of that auction and specify it.

## Calculating Item Price

This program calculates the price of an item in 2 ways.

The first is to find the raw cost of the item by looking at the:<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-item value<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-reforge value<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-enchant value<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-recomb value<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-fuming value
  
 Using this it can determine an accurate raw cost.<br>
 It then takes 85% of this as a guess of how much it will sell for on the auction house.
 
 ### The seccond aproach is by looking at what similar items are selling at on the auction house.
 
 It does this by generating a score for every item depending on what it is missing.<br>
 If there are not enough similar items on the auction house it may return NaN.
 
