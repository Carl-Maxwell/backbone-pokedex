Pokedex.Models.Pokemon = Backbone.Model.extend({
  urlRoot: "/pokemon",
  toys: function() {
    if (typeof this._toys === "undefined") {
      this._toys = new Pokedex.Collections.Toys();
    }
    return this._toys;
  },

  parse: function(payload) {
    if (typeof payload.toys !== "undefined") {
      this.toys().set(payload.toys);
      delete payload.toys;
    }
    return payload;
  }
});
