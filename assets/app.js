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
  //console.log("Paste is here", udAction);
  //console.log(elementor.getCurrentElement());

  //Paste the element
  if (udAction.name) {
    $e.run("document/ui/paste");
  } else {
    $e.run("document/ui/paste", {
      container: elementor.getPreviewContainer(),
      at: elementor.getCurrentElement()
    });
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
