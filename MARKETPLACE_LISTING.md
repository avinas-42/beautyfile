# Beauty File — textes fiche Google Workspace Marketplace

À copier-coller dans **Store listing** (langue par défaut **English** ; section française optionnelle si tu ajoutes une locale).

Limite habituelle **description courte** : **≤ 200 caractères** (espaces compris).

**Marques :** utilise les symboles **™** pour les produits Google cités ; cf. [branding Marketplace](https://developers.google.com/workspace/marketplace/terms/branding#giving_proper_attribution).

---

## English

### Short description (156 characters)

```
Beauty File for Google Docs™: font, size, bold, italic, underline & color—apply to all text or only upper- or lowercase letters. Categories, swatches & hex.
```

### Detailed description

```
Beauty File is a Google Workspace™ sidebar add-on for Google Docs™: precise, targeted formatting—without forcing a whole-document case change.

HOW TO OPEN THE ADD-ON
Open Google Docs™, then open the add-ons panel from the right side (puzzle icon / Extensions → add-ons). The main Beauty File form appears there—not only the Extensions → Beauty File → Help menu. Attach at least one Marketplace screenshot showing the full sidebar panel with the Apply button.

WHAT IT DOES
• Letter scope: format all text in the document, or restrict changes to letters that already appear as uppercase or lowercase (based on how each character displays locally). This is not a global “make everything caps” tool—it only affects the ranges you choose.
• Typography: pick a font family from curated categories (sans-serif, serif, monospace, display, handwriting, and Docs classics), or leave the font unchanged.
• Size: set point size (pt) for the selected scope.
• Emphasis: none, bold, italic, underline, or sensible combinations (e.g. bold + italic).
• Color: choose from swatches, enter compact RGB values, or type a hex color (#rrggbb). Leave color empty to skip.

EFFICIENCY
Your last options are remembered for the next time you open the add-on, so you can iterate quickly on titles, glossaries, or mixed-case content.

WHO IT’S FOR
Writers, editors, and teams who need consistent styling on specific letter patterns—headings in caps, body text, glossaries, bilingual documents—directly inside Google Docs™.

TRUST & PRIVACY
Beauty File runs on Google Apps Script™ when you use it in Google Docs™. It accesses only the document you have open to apply the formatting you trigger. See our privacy policy for details.

Support: arnauz72@gmail.com

Google Docs™, Google Workspace™, and Google Apps Script™ are trademarks of Google LLC.
```

---

## Français (locale optionnelle)

### Description courte (155 caractères)

```
Beauty File pour Google Docs™ : police, taille, gras, italique, souligné et couleur sur tout le texte ou seulement majuscules/minuscules. Pastilles ou hex.
```

### Description détaillée

```
Beauty File est un module complémentaire Google Workspace™ pour Google Docs™ (panneau latéral) : mise en forme précise et ciblée—sans imposer une conversion de casse sur tout le document.

COMMENT OUVRIR LE MODULE
Ouvrez Google Docs™, puis le panneau des compléments à droite (icône puzzle ou Extensions → Compléments). Le formulaire Beauty File s’affiche là—notamment pas seulement Extensions → Beauty File → Aide. Joignez au moins une capture montrant le panneau latéral complet avec le bouton Apply.

À QUOI ÇA SERT
• Portée des lettres : appliquez la mise en forme sur tout le texte du document, ou uniquement sur les lettres qui s’affichent déjà en majuscules ou en minuscules (selon le rendu local). Ce n’est pas un outil « tout passer en majuscules » sur tout le fichier : seules les plages choisies sont concernées.
• Police : choisissez une famille parmi des catégories (sans-serif, serif, monospace, affichage, écriture manuscrite, classiques Docs), ou laissez la police inchangée.
• Taille : réglez la taille en points (pt) pour la portée sélectionnée.
• Emphasis : aucun, gras, italique, souligné, ou combinaisons (ex. gras + italique).
• Couleur : pastilles, saisie RGB compacte ou couleur hexadécimale (#rrggbb). Laissez vide pour ne pas modifier la couleur.

PRATICITÉ
Vos dernières options sont mémorisées pour la prochaine ouverture du module.

PUBLIC
Rédacteurs, éditeurs et équipes qui harmonisent la mise en forme sur des motifs de lettres précis—directement dans Google Docs™.

CONFIANCE & DONNÉES
Beauty File s’exécute dans Google Apps Script™ lorsque vous l’utilisez dans Google Docs™. Voir la politique de confidentialité pour le détail.

Support : arnauz72@gmail.com

Google Docs™, Google Workspace™ et Google Apps Script™ sont des marques de Google LLC.
```

---

## Resubmission checklist (manuel)

1. Coller les textes ci-dessus dans **Store listing** ; ajouter **capture(s)** du panneau latéral complet.
2. Renseigner **Developer website** vers `developer.html` sur GitHub Pages (voir [docs/developer.html](docs/developer.html)).
3. Aligner les scopes : [MARKETPLACE_SCOPES.md](MARKETPLACE_SCOPES.md).
4. `npm run push` puis `npm run deploy:test` (ou déploiement équivalent) ; vérifier le **même Deployment ID** que dans le Marketplace SDK.
5. **Enregistrer le brouillon** puis **Soumettre pour examen**. En cas de doute sur le bouton Aide seul, écrire à **gwm-review@google.com** en expliquant l’ouverture via le panneau latéral.
