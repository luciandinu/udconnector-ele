/*
Elementor frontend functionality
--------------------------------
*/

var elementorFrame;

//Get the elementor frame
document.addEventListener("DOMContentLoaded", event => {
  elementorFrame = document.querySelector("#elementor-preview-iframe");
  RegisterContextMenuActions();
});

//On frame loaded add the Paste button for sections
jQuery("#elementor-preview-iframe").on("load", function() {
  AddPasteButtonOnElementorNewSection();
  //RegisterContextMenuActions();
});

function AddPasteButtonOnElementorNewSection() {
  var elementorSection = elementorFrame.contentDocument.querySelector(
    "#elementor-add-new-section"
  );

  var customCSS = `
    .ud-paste-button {
        background-color: #488CDB;
        margin-left: 5px;
    `;
  var cssElement = elementorFrame.contentDocument.createElement("style");
  cssElement.innerHTML = customCSS;
  elementorFrame.contentDocument.querySelector("body").appendChild(cssElement);

  var newButton = `
    <div class="elementor-add-section-area-button ud-paste-button" title="Paste from UD">
				<i class="eicon-plus"></i>
			</div>
    `;
  elementorSection
    .querySelector(".elementor-add-template-button")
    .insertAdjacentHTML("afterend", newButton);

  //Attach the click to the button
  jQuery("#elementor-preview-iframe")
    .contents()
    .on("click", ".ud-paste-button", function() {
      udPasteElement(this);
    });
}

//Registering contextual items in elementor
function RegisterContextMenuActions() {
  elementor.hooks.addFilter("elements/widget/contextMenuGroups", function(
    groups,
    widget
  ) {
    return udRegisterPasteActionInElementor(groups, widget);
  });
  elementor.hooks.addFilter("elements/column/contextMenuGroups", function(
    groups,
    column
  ) {
    return udRegisterPasteActionInElementor(groups, column);
  });
  elementor.hooks.addFilter("elements/section/contextMenuGroups", function(
    groups,
    section
  ) {
    return udRegisterPasteActionInElementor(groups, section);
  });
}

function udPasteElement(udAction) {
  if (iCanPaste) {
    navigator.clipboard
      .readText()
      .then(function(clipText) {
        if (JSON.parse(atob(clipText).trim(" "))) {
          var clipObj = JSON.parse(atob(clipText).trim(" "));
          //if (clipObj.elementor) {
          insertElement(clipObj);
          //}
        }
      })
      .catch(err => {
        console.log("Something went wrong", err);
      });
  }
}

function insertElement(udElement) {
  //console.log(udElement);

  var foundNodes = _searchTree(
    udElement,
    function(oNode) {
      if (oNode["widgetType"] === "image") return true;
    },
    false
  );

  //console.log(foundNodes);

  //Prepare the object array with the images to be uploaded
  var uploadImages = [];
  foundNodes.forEach(function(nodeFound) {
    var convImage = {
      id: nodeFound.settings.image.id, //Get the id from Elementor
      url: nodeFound.settings.image.url //Get the url from Elementor
    };
    uploadImages.push(convImage);
  });

  //Make the ajax call to upload images
  if (uploadImages.length > 0) {
    jQuery.ajax({
      url: ajaxurl,
      type: "POST",
      dataType: "json",
      data: {
        action: "upload_images_to_wp",
        images: JSON.stringify(uploadImages)
      },
      success: function(obj) {
        returnData = obj;

        returnData.forEach(function(newEl) {
          foundNodes.forEach(function(nodeFound) {
            if (nodeFound.settings.image.id == newEl.id) {
              nodeFound.settings.image.id = newEl.new_id;
              nodeFound.settings.image.url = newEl.new_url;
            }
          });
        });
        elementorCommon.storage.set("clipboard", udElement);
        udPasteElementorCommand();
      }
    });
  } else {
    elementorCommon.storage.set("clipboard", udElement);
    udPasteElementorCommand();
  }
}

function udPasteElementorCommand() {
  //Paste the element
  var wt = elementor.getCurrentElement().model.attributes.elType;
  if (wt == 'section' || wt =='column' ) {
    console.log('ok - inside');
    $e.run("document/ui/paste");
  } else {
    $e.run("document/ui/paste", {
      container: elementor.getPreviewContainer(),
      at: elementor.getCurrentElement()
    });
    console.log('ok - outside');
  }
}

function udRegisterPasteActionInElementor(groups, element) {
  //Making sure that where we insert this is the right group
  var whereGroup = _.findWhere(groups, { name: "clipboard" });
  if (!whereGroup) {
    whereGroup = _.findWhere(groups, { name: "transfer" });
  }
  if (!whereGroup) {
    return groups;
  }
  jQuery.each(groups, function(index, value) {
    if (
      value.name == "transfer" ||
      value.name == "clipboard" ||
      value.name == "paste"
    ) {
      if (!_.findWhere(groups[index].actions, { name: "paste_from_ud" })) {
        groups[index].actions.push({
          name: "paste_from_ud",
          title: "Paste from UD",
          callback: function() {
            pasteAction = _.findWhere(whereGroup.actions, {
              name: "paste_from_ud"
            });
            return udPasteElement(pasteAction);
          }
        });
      }
    }
  });

  return groups;
}

/*
Helper functions 
----------------
*/

function iCanPaste() {
  return (
    navigator.clipboard &&
    typeof navigator.clipboard.readText === "function" &&
    (location.protocol == "https:" ||
      location.hostname == "localhost" ||
      location.hostname == "127.0.0.1")
  );
}

/**searchs through all arrays of the tree if the for a value from a property
 * @param aTree : the tree array
 * @param fCompair : This function will receive each node. It's upon you to define which 
                     condition is necessary for the match. It must return true if the condition is matched. Example:
                        function(oNode){ if(oNode["Name"] === "AA") return true; }
 * @param bGreedy? : us true to do not stop after the first match, default is false
 * @return an array with references to the nodes for which fCompair was true; In case no node was found an empty array
 *         will be returned
*/
var _searchTree = function(aTree, fCompair, bGreedy) {
  var aInnerTree = []; // will contain the inner children
  var oNode; // always the current node
  var aReturnNodes = []; // the nodes array which will returned

  // 1. loop through all root nodes so we don't touch the tree structure
  for (keysTree in aTree) {
    aInnerTree.push(aTree[keysTree]);
  }
  while (aInnerTree.length > 0) {
    oNode = aInnerTree.pop();
    // check current node
    if (fCompair(oNode)) {
      aReturnNodes.push(oNode);
      if (!bGreedy) {
        return aReturnNodes;
      }
    } else {
      // if (node.children && node.children.length) {
      // find other objects, 1. check all properties of the node if they are arrays
      for (keysNode in oNode) {
        // true if the property is an array
        if (oNode[keysNode] instanceof Array) {
          // 2. push all array object to aInnerTree to search in those later
          for (var i = 0; i < oNode[keysNode].length; i++) {
            aInnerTree.push(oNode[keysNode][i]);
          }
        }
      }
    }
  }
  return aReturnNodes; // someone was greedy
};
