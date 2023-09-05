/*

༼ つ ◕_◕ ༽つ

Script name: Kirby
Author: Kamil Wojdyna

Created for Groupon

*/

var control_stats = {"accounts_count": 0,
                    "campaigns_count": 0,
                    "ad_groups_count": 0,
                    "bid_updates": 0,
                    "bid_updates_increase": 0,
                    "bid_updates_decrease": 0};

function main() {
  // Spreadsheet setup!
  var sheet_control_name = "Swallow bids";
  var columns = {"Country": 0, "Placement Type": 1, "Strategy Type": 2, "Bid": 4}; 
  var sh = "https://docs.google.com/spreadsheets/d/1B5Ria1OHAvlMj_ZMSsqYkgqXpqR9O7mNR35AkbtrMI4/edit#gid=90035433";
  sheet = sheetConnector(sh, sheet_control_name);
  
  // We're take bids from here:
  var bids = sheet.getRange("$A:$E").getValues();
  
  // Building bid tree!
  var bidTree = {};
  for(var i = 1; i < bids.length - 1; i++)
  {
    var currentCountry = bids[i][columns["Country"]].trim();
    // if (currentCountry != "AU") continue;
    var currentPlacement = bids[i][columns["Placement Type"]].trim();
    var currentStrategy = bids[i][columns["Strategy Type"]].trim().toLowerCase();
    var currentBid = bids[i][columns["Bid"]];
    bidTree[glueCampaignName(currentCountry, currentPlacement) + "_" + currentStrategy] = currentBid;
  }
  Logger.log("Bid tree: " + JSON.stringify(bidTree));
  // We've ended building bid tree!
  
  // Moving to the process of assigning bids to ad groups.
  swallowBids(bidTree);
  
  // Printing stats...
  Logger.log(JSON.stringify(control_stats));
}

// The main job of this function is to iterate through child accounts
// and call "updateBids".
function swallowBids(bidTree) {
  
  var mccAccount = AdsApp.currentAccount();
  var childAccounts = AdsManagerApp.accounts().get();
  
  while (childAccounts.hasNext())
  {
    control_stats["accounts_count"]++;
    var childAccount = childAccounts.next();
    AdsManagerApp.select(childAccount);
    updateBids(bidTree);
  }
  
  // We're changing context to MCC account after the job.
  AdsManagerApp.select(mccAccount);
}

function updateBids(bidTree) {
  Logger.log("Updating bids...");
  // Logger.log(JSON.stringify(bidTree));
  var campaignIterator = AdsApp.campaigns().get();

  // Iterating through campaigns and ad groups.
  while (campaignIterator.hasNext()) {
    var campaign = campaignIterator.next();
    
    // No time to waste on paused campaigns!
    if(campaign.isEnabled() == false) continue;
    control_stats["campaigns_count"]++;
    
    c_name = campaign.getName().toLowerCase();
    
    // if(!(c_name.indexOf("-au-") > -1)) continue;

    // Taking ad groups...
    adGroupsIterator = campaign.adGroups().get();
    while(adGroupsIterator.hasNext())
    {
      var ad_group = adGroupsIterator.next();
      // No time to waste on paused ad groups!
      
      if(ad_group.isEnabled() == false) continue;
      control_stats["ad_groups_count"]++;
      g_name = ad_group.getName().toLowerCase();
      // Logger.log("ad groupa: " + ad_group.getName());
      Logger.log("Searching for a bid for " + c_name + "_" + g_name);
      bid = bidTree[c_name + "_" + g_name];
      
      if(bid)
      {
        Logger.log("I've found new bid: " + bid);
        control_stats["bid_updates"]++;
        var old_bid = ad_group.bidding().getCpa()
        var new_bid = old_bid * ((100 + bid)/100);
        ad_group.bidding().setCpa(new_bid);
        Logger.log("Old bid " + old_bid + "; New bid " + new_bid);
        
        if(bid >=0)
        {
          control_stats["bid_updates_increase"]++;
        }
        else
        {
          control_stats["bid_updates_decrease"]++;
        }
      }
      else
        Logger.log("No bid update");
    }
  }
}