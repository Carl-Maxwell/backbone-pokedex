Pokedex.Views.Pokemon = Backbone.View.extend({
  initialize: function () {
    this.$pokeList = this.$el.find('.pokemon-list');
    this.$pokeDetail = this.$el.find('.pokemon-detail');
    this.$newPoke = this.$el.find('.new-pokemon');
    this.$toyDetail = this.$el.find('.toy-detail');

    this.pokemon = new Pokedex.Collections.Pokemon();
    this.$pokeList.on("click", ".poke-list-item" ,this.selectPokemonFromList.bind(this));
    this.$pokeDetail.on("click", ".toy-list-item", this.selectToyFromList.bind(this));
    this.$pokeDetail.on("submit", ".detail", this.submitDetailForm.bind(this));
    this.$newPoke.on("submit", this.submitPokemonForm.bind(this));

    this.$toyDetail.on("change", ".selector", this.reassignToy.bind(this));

  },

  submitDetailForm: function (e) {
    e.preventDefault();
    var $target = $(e.currentTarget);
    var formData = $target.serializeJSON();
    var pokemon = this.pokemon.get($target.data("pokemon-id"));
    var self = this;
    pokemon.save(formData.pokemon, {
      success: function  () {
        alert("Pokemon saved!");
        self.$pokeList.empty();
        self.pokemon.forEach(function (poke) {
          self.addPokemonToList(poke);
        });
      }
    });
  },

  addPokemonToList: function (pokemon) {
    var $li = $('<li>');
    $li.addClass('poke-list-item');
    $li.text("name: " + pokemon.get('name') + ", type: " + pokemon.get("poke_type"));
    $li.data("id", pokemon.get("id"));
    this.$pokeList.append($li);
  },

  refreshPokemon: function () {
    var self = this;
    this.pokemon.fetch({ success: function (pokemon) {
      pokemon.models.forEach(function(el) {
        self.addPokemonToList(el);
      });
    }});
  },

  renderPokemonDetail: function(pokemon) {
    var $detail = $('<form>');
    $detail.addClass('detail');
    var $photo = $('<img>');
    $photo.attr('src', pokemon.get('image_url'));
    $detail.append($photo);

    $detail.data('pokemon-id', pokemon.get('id'));

    // for(var key in pokemon.attributes) {}

    Object.keys(pokemon.attributes).forEach(function(key) {
      if (key === "image_url"){return;}
      if (key === "id") {return;}
      var $input = $('<input>');
      $input.attr('type', 'text').attr("name", "pokemon[" + key + "]");
      $input.val(pokemon.get(key));

      var $label = $('<label>');
      $label.text(key + ": ");

      $label.append($input);
      $detail.append($label);
    });

    var $submit = $('<input type="submit">');
    $detail.append($submit);

    this.$pokeDetail.html($detail);
    this.$pokeDetail.append($('<ul>').addClass('toys'));
    var self = this;
    pokemon.fetch({success: function() {
      self.renderToysList(pokemon.toys());
    }});
  },

  addToyToList: function (toy) {
    var $li = $('<li>').addClass('toy-list-item');
    $li.data("id", toy.get("id"));
    ['name', 'happiness', 'price'].forEach( function (key) {
      var $p = $('<p>');
      $p.text(key + ": " + toy.get(key));
      $li.append($p);
    } );

    this.$pokeDetail.find('.toys').append($li);
  },

  renderToyDetail: function(toy) {
    var $detail = $('<div>').addClass('detail');

    var $photo = $('<img>').attr('src', toy.get('image_url'));
    $detail.append($photo);

    Object.keys(toy.attributes).forEach(function(key) {
      if (key === "image_url"){return;}
      var $p = $('<p>');
      $p.text(key + ": " + toy.get(key));
      $detail.append($p);
    });
    var pokemonId = toy.get("pokemon_id");
    var id = toy.get("id");
    var $select = $('<select>').data("pokemon-id", pokemonId)
                               .data("toy-id", id);
    $select.addClass("selector");
    this.pokemon.forEach(function(poke){
      var $option = $('<option>');
      $option.text(poke.get("name")).val(poke.get("id"));

      if (poke.get("id") === pokemonId) {$option.prop("selected", true);}
      $select.append($option);
    });

    $detail.append($select);
    this.$toyDetail.html($detail);
  },

  selectPokemonFromList: function (e) {
    this.$toyDetail.empty();
    var $el = $(e.currentTarget);
    var id = $el.data("id");
    var pokemon = this.pokemon.get(id);
    this.renderPokemonDetail(pokemon);
  },

  selectToyFromList: function (e) {
    var $el = $(e.currentTarget);
    var id = $el.data("id");
    var pokemonId = this.$pokeDetail.find('.detail').data("pokemon-id");
    var pokemon = this.pokemon.get(pokemonId);
    var toy = pokemon.toys().get(id);
    this.renderToyDetail(toy);
  },

  createPokemon: function(attributes, callback) {
    var pokemon = new Pokedex.Models.Pokemon(attributes);
    var self = this;
    pokemon.save({}, { success: function() {
      self.addPokemonToList(pokemon);
      self.pokemon.add(pokemon);
      callback(pokemon);
    } });
  },

  submitPokemonForm: function(e) {
    e.preventDefault();
    var target = $(e.currentTarget);
    var formData = target.serializeJSON();
    this.createPokemon(formData.pokemon, this.renderPokemonDetail.bind(this));
  },

  reassignToy: function(e) {
    var $target = $(e.currentTarget);

    var oldPokemonId = $target.data('pokemon-id');
    var newPokemonId = $target.val();
    var toyId = $target.data('toy-id');

    var pokemon = this.pokemon.get(oldPokemonId);

    var toy = pokemon.toys().get(toyId);
    toy.set("pokemon_id", newPokemonId);

    var self = this;

    toy.save({}, {success: function() {
      pokemon.toys().remove(toyId);
      self.renderToysList(pokemon.toys());
      self.$toyDetail.empty();
    }});
  },

  renderToysList: function (toys) {
    this.$pokeDetail.find('.toys').empty();
    var self = this;
    toys.forEach(function(toy) {
      self.addToyToList(toy);
    });
  }
});
