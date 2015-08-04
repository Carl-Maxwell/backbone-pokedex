json.extract! pokemon, :id, :attack, :defense, :image_url, :moves, :name, :poke_type

if display_toys
  json.toys do
    json.array! pokemon.toys, partial: 'toys/toy', as: :toy
  end
end
