let receipes = [];

/* Fonction qui charge les recettes et appelle la fonction afficherRecette pour construire le tableau HTML des recettes
*/
function init() {
  fetch('http://localhost:3000/receipes')
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('URL inaccessible');
    }
    )
    .then(json => afficherRecette(json))
    .catch(e => {
      let affichage = document.querySelector("#affichage");
      affichage.innerHTML = "<h2>Impossible de récupérer les résultats</h2> : " + e;
    });
}

/* READ => Construit le tableau HTML des recettes avec en paramètre le JSON retourné par le serveur
 */
let btnCount = 0;
function afficherRecette(res) {
  receipes = res;
  let html = "<table class='table table-bordered table-striped'>";
  html += "<thead class='table-primary'>";
  html += "<tr>";
  html += "<th>Nom</th>";
  html += "<th>Nombre de parts</th>";
  html += "<th>Description</th>";
  html += "<th>Lien</th>";
  html += "<th>Ingredients</th>";
  html += "<th>Modifier</th>";
  html += "<th>Supprimer</th>";
  html += "</tr>";
  html += "</thead>";
  html += "<tbody>";
  for (receipe of receipes) {
    html += "<tr>";
    html += "<td>" + receipe.name + "</td>";
    html += "<td>" + receipe.nb_part + "</td>";
    html += "<td>" + receipe.description + "</td>";
    html += "<td>" + receipe.link + "</td>";
    html += "<td>";
    for (ingredient of receipe.ingredients) {
      html += ingredient.name + " : ";
      html += ingredient.quantity;
      html += ingredient.unit + "</br>";
    }
    html += "</td>";
    html += "<td><i class='fas fa-lg fa-pen text-warning' id=\"btnModifierRecette"+btnCount +"\" onclick=\"updateRecette('" + receipe.id + "')\"></i></td>";
    html += "<td><i class='fas fa-lg fa-trash text-danger' onclick=\"supprimerRecette('" + receipe.id + "')\"></i></td>";
    html += "</tr>"
    btnCount++;
  }
  html += "</tbody>";
  html += "</table>";

  let affichage = document.querySelector("#affichage");
  affichage.innerHTML = html;
}

/* Pour générer des id unique
 */
function generate_UUID() {
  var dt = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

/* Pour ajouter des ingredients lors de la création de la recette
*/
let ingrCount = 0;
function ajouterIngredient() {
  let container = document.querySelector("#ingr_container");
  let ingr = document.createElement("div");
  ingr.classList.add("ingr");

  let nomI = document.createElement("input");
  nomI.type = "text";
  nomI.name = "nomI";
  nomI.id = "nomI" + ingrCount;
  nomI.placeholder = "Nom de l'ingrédient";

  let quantity = document.createElement("input");
  quantity.type = "number";
  quantity.min = 0;
  quantity.max = 999;
  quantity.name = "quantity";
  quantity.id = "quantity" + ingrCount;
  quantity.placeholder = "Quantité";

  // Ne vérouille pas la saisie mais informe l'utilisateur qu'il doit renseigner un chiffre entre 0 et 999
  quantity.addEventListener("input", function(event) {
    if (this.value > 999 || this.value < 0) {
      event.preventDefault();
      alert("La quantité doit être comprise entre 0 et 999");
    }
  });

  let unit = document.createElement("select");
  unit.name = "unit";
  unit.id = "unit" + ingrCount;

  let option0 = document.createElement("option");
  option0.value = "";
  option0.innerHTML = "";
  unit.appendChild(option0); 

  let option1 = document.createElement("option");
  option1.value = "mg";
  option1.innerHTML = "mg";
  unit.appendChild(option1);

  let option2 = document.createElement("option");
  option2.value = "g";
  option2.innerHTML = "g";
  unit.appendChild(option2);

  let option4 = document.createElement("option");
  option4.value = "kg";
  option4.innerHTML = "kg";
  unit.appendChild(option4);

  let option5 = document.createElement("option");
  option5.value = "cl";
  option5.innerHTML = "cl";
  unit.appendChild(option5);

  let option6 = document.createElement("option");
  option6.value = "ml";
  option6.innerHTML = "ml";
  unit.appendChild(option6);

  let option7 = document.createElement("option");
  option7.value = "l";
  option7.innerHTML = "l";
  unit.appendChild(option7);

  let option8 = document.createElement("option");
  option8.value = "c.à.s";
  option8.innerHTML = "c.à.s";
  unit.appendChild(option8);

  let option9 = document.createElement("option");
  option9.value = "c.à.c";
  option9.innerHTML = "c.à.c";
  unit.appendChild(option9);

  let option10 = document.createElement("option");
  option10.value = "sachet";
  option10.innerHTML = "sachet";
  unit.appendChild(option10);

  ingr.appendChild(unit);

  let button = document.createElement("button");
  button.innerHTML = "Supprimer";
  button.onclick = function () {
    ingr.remove();
  }

  ingr.appendChild(nomI);
  ingr.appendChild(quantity);
  ingr.appendChild(unit);
  ingr.appendChild(button);
  container.appendChild(ingr);
  ingrCount++;
}

/* CREATE => Traiter le formulaire et envoyer une nouvelle recette vers le serveur
*/
function ajouterRecette() {
  let id = generate_UUID();
  let nomR = document.querySelector("#nomRecette").value;
  let nb_part = document.querySelector("#nbPart").value;
  let description = document.querySelector("#description").value;
  let link = document.querySelector("#link").value;
  let ingredients = [];
  // Récupération des valeurs de chaque ingrédient ayant la classe "ingr"
  let ingrElements = document.querySelectorAll(".ingr");
  for (let i = 0; i < ingrElements.length; i++) {
    let nomI = ingrElements[i].querySelector("#nomI" + i).value;
    let quantity = ingrElements[i].querySelector("#quantity" + i).value;
    //let unit = ingrElements[i].querySelector('input[ name = "unit" ]:checked').value; //btn radio
    let unit = ingrElements[i].querySelector("#unit" + i).value;
    ingredients.push({
      "name": nomI,
      "quantity": quantity,
      "unit": unit
    });
  }

  let objet = {
    "id": id,
    "name": nomR,
    "nb_part": nb_part,
    "description": description,
    "link": link,
    "ingredients": ingredients
  }
  callServeur('http://localhost:3000/receipes', objet, 'POST');
}

/* UPDATE => Permet de mettre à jour une recette en fonction de son id
*/
function updateRecette(id) {
  // Récupération de la recette à mettre à jour
  fetch('http://localhost:3000/receipes/' + id)
    .then(response => response.json())
    .then(recette => {
      //document.querySelector("#ingr_container").innerHTML = '';
      // Remplissage des champs du formulaire avec les données de la recette
      document.querySelector("#nomRecette").value = recette.name;
      document.querySelector("#nbPart").value = recette.nb_part;
      document.querySelector("#description").value = recette.description;
      document.querySelector("#link").value = recette.link;

      // Pour récupérer tous les ingredients de la recette
      let ingredients = recette.ingredients;
      for (let i = 0; i < ingredients.length; i++) {
        ajouterIngredient(ingredients.length);
        document.querySelector("#nomI" + i).value = ingredients[i].name;
        document.querySelector("#quantity" + i).value = ingredients[i].quantity;
        document.querySelector("#unit" + i).value = ingredients[i].unit;
      }
    
      // Afficher le bouton Enregistrer les modifications
      document.querySelector("#btnUpdate").style.display = "block";
      // Faire disparaitre le bouton Ajouter la recette
      document.querySelector("#btnCreate").style.display = "none";

      // Mise à jour de la recette lorsque le formulaire est soumis
      let form = document.querySelector("#formRecette");
      form.addEventListener("submit", event => {
        event.preventDefault();
        let nomR = document.querySelector("#nomRecette").value;
        let nb_part = document.querySelector("#nbPart").value;
        let description = document.querySelector("#description").value;
        let link = document.querySelector("#link").value;
        let ingredients = [];
        // Récupération des valeurs de chaque ingrédient ayant la classe "ingr"
        let ingrElements = document.querySelectorAll(".ingr");
        for (let i = 0; i < ingrElements.length; i++) {
          let nomI = ingrElements[i].querySelector("#nomI" + i).value;
          let quantity = ingrElements[i].querySelector("#quantity" + i).value;
          let unit = ingrElements[i].querySelector("#unit" + i).value;
          ingredients.push({
            "name": nomI,
            "quantity": quantity,
            "unit": unit
          });
        }
        let objet = {
          "id": id,
          "name": nomR,
          "nb_part": nb_part,
          "description": description,
          "link": link,
          "ingredients": ingredients
        };
        callServeur('http://localhost:3000/receipes/' + id, objet, 'PUT');
      });
    });
}

/* DELETE => Permet de supprimer une recette en fonction de son id
*/
function supprimerRecette(id) {
  for (receipe of receipes) {
    if (receipe.id == id) {
      if (window.confirm("Voulez-vous supprimer la recette de " + receipe.name + " ?")) {
        callServeur('http://localhost:3000/receipes/' + id, receipe, 'DELETE');
      }
    }
  }
}

/* Méthode d'appel du serveur qui provoque le rafraichissement du tableau des recettes (évite de faire un fetch à chaque fonction)
*/
function callServeur(url, objet, method) {
  const requestOptions = {
    "method": method,
    "headers": { 'Content-Type': 'application/json' },
    "body": JSON.stringify(objet)
  };
  fetch(url, requestOptions)
    .then(response => response.json())
    .then(dataJson => init());
}


document.addEventListener("DOMContentLoaded", init);

/*     fetch('http://localhost:3000/receipes')
      .then(response => response.json())
      .then(receipes => console.log(receipes)) */


