import { GitHubUser } from "./githubUser.js"

// classe contendo a lógica dos dados e como eles serão estruturados
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.loadData();
  }

  loadData() {
    this.usersEntries =
      JSON.parse(localStorage.getItem("@github-favorites:")) || [];
  }

  saveData() {
    localStorage.setItem(
      "@github-favorites:",
      JSON.stringify(this.usersEntries)
    );
  }

  async add(username) {
    try {
      const userExists = this.usersEntries.find(entry => entry.login === username)

      if(userExists) {
        throw new Error('Usuário já cadastrado')
      }

      const user = await GitHubUser.search(username);

      if (user.login === undefined) {
        throw new Error("Usuário inválido ou não encontrado");
      }

      this.usersEntries = [user, ...this.usersEntries];
      this.update();
      this.saveData();

    } catch (error) {
      alert(error.message);
    }
  }

  delete(user) {
    const filteredEntries = this.usersEntries.filter(
      (entry) => entry.login !== user.login
    );

    this.usersEntries = filteredEntries;
    this.update();
    this.saveData();
  }
}

// classe que vai criar a visualização e os eventos do html
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);

    this.tbody = this.root.querySelector("table tbody");

    this.update();
    this.onAdd();
  }

  onAdd() {
    const addButton = this.root.querySelector(".search button");
    addButton.onclick = () => {
      const { value } = this.root.querySelector(".search input");

      this.add(value);
    };
  }

  update() {
    this.removeAllTr();

    this.usersEntries.forEach((user) => {
      const row = this.createRow();

      row.querySelector(
        ".user img"
      ).src = `https://github.com/${user.login}.png`;
      row.querySelector(".user img").alt = `Foto ou imagem de ${user.name}`;
      row.querySelector(".user p").textContent = user.name;
      row.querySelector(".user a").href = `https://github.com/${user.login}`;
      row.querySelector(".user span").textContent = user.login;
      row.querySelector(".repositories").textContent = user.public_repos;
      row.querySelector(".followers").textContent = user.followers;

      row.querySelector(".remove-user").onclick = () => {
        const okRemoveUser = confirm(
          "Tem certeza de que deseja excluir este usuário?"
        );
        if (okRemoveUser) {
          this.delete(user);
        }
      };

      this.tbody.append(row);
    });
  }

  createRow() {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="user">
          <img src="https://github.com/pcbandeira-m.png" alt="">
          <a href="https://github.com/pcbandeira-m" target="_blank">
            <p>Patricia Melo</p>
            <span>pcbandeira-m</span>
          </a>
      </td>
      <td class="repositories">
        nº de repositórios
      </td>
      <td class="followers">
        nº de seguidores
      </td>
      <td>
        <button class="remove-user">&times;</button>
      </td>
    `;

    return tr;
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove();
    });
  }
}