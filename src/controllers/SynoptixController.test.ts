import { findAllFormsForWord, findNewMovie } from "./SynoptixController";
import { loadDatabase } from "./MongoController";
import { WordModel } from "../models/mongo/Word/Word.model";

jest.mock("../models/mongo/Word/Word.model.ts");

// beforeAll(async () => {
//   await loadDatabase();
// });

describe("Words matcher; no cache", () => {
  const test: [string, string[]][] = [
    ["le", ["le", "la", "les", "l"]],
    ["la", ["la", "le", "les", "l"]],
    ["les", ["la", "le", "les", "l"]],
    // ["policier", ["policier", "policiers", "policières", "policière"]],
    // ["policières", ["policier", "policiers", "policières", "policière"]],
  ];
  it.each(test)(
    "should find all form for a word",
    async (requestedWord, expected) => {
      jest.mocked(WordModel.findOneContaining).mockImplementation(() => {
        return Promise.resolve(undefined);
      });
      const forms = await findAllFormsForWord(requestedWord);
      expect(forms.sort()).toStrictEqual(expected.sort());
    }
  );
});

describe("find movie", () => {
  it("should find the movie Edward aux mains d'argent", async () => {
    const result = {
      id: 103704,
      title: "<p>Edward aux mains d'argent</p>",
      synopsis: `<p>Une grand-mère raconte une histoire à sa petite-fille pour lui expliquer d'où vient la neige qui tombe sur la ville. Cette histoire commence avec un jeune homme appelé Edward (Johnny Depp) créé par un inventeur (Vincent Price) vivant seul dans un sombre château perché sur une colline. Mais l'inventeur meurt avant d'avoir pu achever son œuvre, laissant Edward avec des ciseaux aux lames extrêmement acérées à la place des mains. Edward vit donc seul dans ce sinistre château jusqu'au jour où Peg Boggs (Dianne Wiest), représentante en cosmétiques Avon, découvre le château et, poussée par la curiosité, se présente à sa porte. Voyant que le jeune homme, timide et inoffensif, vit seul sans avoir le moindre lien avec le monde qui l'entoure, elle décide de l'emmener au sein de son foyer situé dans une tranquille banlieue résidentielle. Edward commence alors à partager la vie de Peg, de son mari Bill (Alan Arkin) et de leur fils Kevin (Robert Oliveri) âgé de douze ans. Il devient très vite le nouveau centre d'intérêt du quartier et est d'abord accueilli à bras ouverts, ses talents de tailleur de haies et de coiffeur lui valant l'admiration et les sollicitations de toutes les voisines.
</p><p>Edward tombe également amoureux de Kim (Winona Ryder), la fille aînée de Peg. Les seuls résidents qui éprouvent instantanément de la répulsion pour Edward sont Esmeralda (O-Lan Jones), une fanatique religieuse, et Jim (Anthony Michael Hall), le petit ami de Kim. Joyce (Kathy Baker), une amie de Peg très entreprenante, tente de séduire Edward, causant un accès de panique chez le jeune homme. Jim pousse ensuite Edward à entrer par effraction chez ses parents pour y dérober de l'argent mais l'alarme se déclenche et Edward est arrêté par la police, avant d'être relâché. Cet incident provoque la colère de Kim, qui reproche à Jim d'avoir piégé Edward, et vaut à ce dernier d'être désormais vu avec méfiance par la communauté du quartier. De plus, Joyce raconte à qui veut l'entendre qu'Edward a tenté de la violer. Les membres de la famille Boggs restent les seuls à soutenir Edward et eux aussi sont mis à l'écart.
</p><p>Le soir de Noël, Edward crée une sculpture de glace, provoquant ainsi un effet de neige qui tombe du ciel, pour le plus grand plaisir de Kim. Jim, jaloux, intervient à ce moment et Edward blesse accidentellement Kim à la main. Jim s'en prend aussitôt à Edward, qui quitte les lieux. Edward est recherché par les habitants du quartier et sauve Kevin en le poussant du chemin d'un véhicule qui allait l'écraser. Mais, ce faisant, il blesse le garçon avec ses ciseaux et les résidents croient à une nouvelle agression de sa part. Edward s'enfuit jusqu'au château, où il est rejoint par Kim. Mais Jim a suivi la jeune fille et s'en prend une nouvelle fois à eux. Quand il frappe Kim, Edward le poignarde avec une de ses lames et Jim fait une chute mortelle. Edward fait ses adieux à Kim, qui l'embrasse et lui avoue son amour. Elle raconte ensuite aux habitants que Jim et Edward se sont entretués et leur présente pour preuve une main en forme de ciseaux similaire à celles d'Edward. La vieille dame qui raconte l'histoire, qui s'avère être Kim, termine en disant à sa petite-fille qu'elle n'a jamais revu Edward, ne voulant pas que celui-ci la voie vieillir. Edward vit toujours dans le château et, étant une création artificielle, n'est pas affecté par les effets du temps. Il provoque parfois des chutes de flocons de neige sur le quartier en travaillant sur ses sculptures de glace : ainsi, Kim sait qu'il est toujours en vie.
</p><p> 
</p>`,
      untreatedSynopsis: `<div class="mw-parser-output"><h2><span class="mw-headline" id="Synopsis">Synopsis</span></h2>
<p>Une grand-mère raconte une histoire à sa petite-fille pour lui expliquer d'où vient la neige qui tombe sur la ville. Cette histoire commence avec un jeune homme appelé Edward (<a href="/wiki/Johnny_Depp" title="Johnny Depp">Johnny Depp</a>) créé par un inventeur (<a href="/wiki/Vincent_Price" title="Vincent Price">Vincent Price</a>) vivant seul dans un sombre château perché sur une colline. Mais l'inventeur meurt avant d'avoir pu achever son œuvre, laissant Edward avec des ciseaux aux lames extrêmement acérées à la place des mains. Edward vit donc seul dans ce sinistre château jusqu'au jour où Peg Boggs (<a href="/wiki/Dianne_Wiest" title="Dianne Wiest">Dianne Wiest</a>), représentante en cosmétiques <a href="/wiki/Avon_Products" title="Avon Products">Avon</a>, découvre le château et, poussée par la curiosité, se présente à sa porte. Voyant que le jeune homme, timide et inoffensif, vit seul sans avoir le moindre lien avec le monde qui l'entoure, elle décide de l'emmener au sein de son foyer situé dans une tranquille banlieue résidentielle. Edward commence alors à partager la vie de Peg, de son mari Bill (<a href="/wiki/Alan_Arkin" title="Alan Arkin">Alan Arkin</a>) et de leur fils Kevin (<a href="/wiki/Robert_Oliveri" title="Robert Oliveri">Robert Oliveri</a>) âgé de douze ans. Il devient très vite le nouveau centre d'intérêt du quartier et est d'abord accueilli à bras ouverts, ses talents de tailleur de haies et de coiffeur lui valant l'admiration et les sollicitations de toutes les voisines.
</p><p>Edward tombe également amoureux de Kim (<a href="/wiki/Winona_Ryder" title="Winona Ryder">Winona Ryder</a>), la fille aînée de Peg. Les seuls résidents qui éprouvent instantanément de la répulsion pour Edward sont Esmeralda (<a href="/wiki/O-Lan_Jones" title="O-Lan Jones">O-Lan Jones</a>), une fanatique religieuse, et Jim (<a href="/wiki/Anthony_Michael_Hall" title="Anthony Michael Hall">Anthony Michael Hall</a>), le petit ami de Kim. Joyce (<a href="/wiki/Kathy_Baker" title="Kathy Baker">Kathy Baker</a>), une amie de Peg très entreprenante, tente de séduire Edward, causant un accès de panique chez le jeune homme. Jim pousse ensuite Edward à entrer par effraction chez ses parents pour y dérober de l'argent mais l'alarme se déclenche et Edward est arrêté par la police, avant d'être relâché. Cet incident provoque la colère de Kim, qui reproche à Jim d'avoir piégé Edward, et vaut à ce dernier d'être désormais vu avec méfiance par la communauté du quartier. De plus, Joyce raconte à qui veut l'entendre qu'Edward a tenté de la violer. Les membres de la famille Boggs restent les seuls à soutenir Edward et eux aussi sont mis à l'écart.
</p><p>Le soir de <a href="/wiki/No%C3%ABl" title="Noël">Noël</a>, Edward crée une sculpture de glace, provoquant ainsi un effet de neige qui tombe du ciel, pour le plus grand plaisir de Kim. Jim, jaloux, intervient à ce moment et Edward blesse accidentellement Kim à la main. Jim s'en prend aussitôt à Edward, qui quitte les lieux. Edward est recherché par les habitants du quartier et sauve Kevin en le poussant du chemin d'un véhicule qui allait l'écraser. Mais, ce faisant, il blesse le garçon avec ses ciseaux et les résidents croient à une nouvelle agression de sa part. Edward s'enfuit jusqu'au château, où il est rejoint par Kim. Mais Jim a suivi la jeune fille et s'en prend une nouvelle fois à eux. Quand il frappe Kim, Edward le poignarde avec une de ses lames et Jim fait une chute mortelle. Edward fait ses adieux à Kim, qui l'embrasse et lui avoue son amour. Elle raconte ensuite aux habitants que Jim et Edward se sont entretués et leur présente pour preuve une main en forme de ciseaux similaire à celles d'Edward. La vieille dame qui raconte l'histoire, qui s'avère être Kim, termine en disant à sa petite-fille qu'elle n'a jamais revu Edward, ne voulant pas que celui-ci la voie vieillir. Edward vit toujours dans le château et, étant une création artificielle, n'est pas affecté par les effets du temps. Il provoque parfois des chutes de flocons de neige sur le quartier en travaillant sur ses sculptures de glace&#160;: ainsi, Kim sait qu'il est toujours en vie.
</p><p><br />
</p></div>`,
    };
    const film = await findNewMovie("Edward aux mains d'argent");
    expect(film).toStrictEqual(result);
  });
  it("should find the movie ", async () => {
    const result = {
      id: 341320,
      title: "<p>Inglourious Basterds</p>",
      synopsis: `<p>Pendant l'occupation de la France, en 1941, une voiture allemande s'approche d'une ferme appartenant à Perrier Lapadite (Denis Ménochet) et ses filles près de Nancy. Le colonel Hans Landa (Christoph Waltz) de la SS, surnommé Citation Le Chasseur de Juifs interroge alors le fermier à propos de rumeurs faisant état d'une famille de Juifs qui serait cachée dans les environs. Après avoir fait pression sur lui, Landa lui extorque l'aveu qu'il cache bien cette famille de Juifs chez lui, puis ordonne à ses hommes de faire feu en direction du plancher sous lequel ils sont cachés. Toute la famille est assassinée, à l'exception de la fille aînée, Shosanna Dreyfus (Mélanie Laurent), qui parvient à s'enfuir sans que Landa la pourchasse, prétendant qu’elle mourra dans la nature.
</p><p>Au printemps 1944, le lieutenant Aldo Raine (Brad Pitt) du 1er détachement du service spécial met sur pied un commando de huit soldats juifs-américains destinés à être parachutés derrière les lignes ennemies, afin de terroriser les soldats allemands. Opérant de manière furtive, ils prennent des groupes en embuscade et massacrent systématiquement les soldats de la Wehrmacht, sans oublier de les scalper. Ils sont connus sous le nom des Citation Bâtards et ont pour politique de ne pas faire de prisonniers. Cependant, un soldat est reçu par Adolf Hitler (Martin Wuttke) et lui narre l'embuscade dans laquelle est tombée sa compagnie. Il raconte au Führer le sauvage assassinat d'un sergent à la batte de baseball par l'un des Bâtards, Donny Donowitz (Eli Roth), surnommé l'Citation Ours juif, et la raison pour laquelle ils lui ont laissé la vie sauve afin qu'il puisse témoigner auprès de ses supérieurs, après lui avoir gravé au couteau une croix gammée sur le front.
</p><p>En date- juin 1944, Shosanna, sous l'identité d'Emmanuelle Mimieux, est devenue propriétaire d'un cinéma à Paris. Elle rencontre un soldat allemand féru de cinéma nommé Fredrick Zoller (Daniel Brühl). Elle apprend plus tard qu'il est un tireur d'élite embusqué dont les exploits militaires en Italie l'ont fait connaître et ont été mis en valeur dans un film de propagande nazi, <i>La Fierté de la Nation</i>. Zoller, très attiré par Shosanna, convainc le docteur Joseph Goebbels (Sylvester Groth) d'organiser la première du film dans le cinéma de celle-ci. Shosanna réalise rapidement que la présence de nombreux hauts dignitaires nazis lui donne une occasion de venger sa famille et elle décide, avec l'aide de son amoureux noir Marcel (Jacky Ido), d'organiser l'incendie de son cinéma à l'aide des nombreuses pellicules au nitrate, extrêmement inflammables, qu'elle y stocke. Alors qu'elle est conduite de force devant Goebbels, Shosanna voit réapparaître le colonel Landa, affecté à la protection de la soirée, sans que l'on sache s'il l'a reconnue.
</p><p>Archie Hicox (Michael Fassbender), lieutenant de l'armée britannique, est convoqué par le général Ed Fenech (Mike Myers) afin de participer à l’<i>Operation Kino</i> (Citation Opération cinéma en français), organisée par une espionne au service des Britanniques, la célèbre actrice allemande Bridget von Hammersmark (Diane Kruger). L'opération consiste à éliminer les nombreux dignitaires et gradés nazis réunis pour la première de <i>La Fierté de la Nation</i> à Paris, en y infiltrant Hicox et deux des Bâtards se faisant passer pour des officiers de la Wehrmacht amis de von Hammersmark. Le rendez-vous de l'actrice et des trois espions, fixé dans la taverne d'un petit village situé à quelques kilomètres de Paris, tourne mal en raison de la présence fortuite d'un groupe de soldats allemands et du major Dieter Hellstrom (August Diehl), de la Gestapo, qui remarque l'étrange accent et la façon toute britannique de commander à boire de Hicox. Leur impasse mexicaine, puis leur affrontement, se soldent par la mort de toutes les personnes présentes, à l'exception de Bridget von Hammersmark, qui est blessée à la jambe dans la fusillade et peut fuir, aidée par Raine. Lorsque celui-ci l'interroge, il apprend que Hitler a également l'intention d'assister à la première et il décide de remplacer les trois espions morts par lui-même, Donny Donowitz et Omar Ulmer (Omar Doom), en se faisant passer pour des amis italiens de l'actrice. Landa enquête sur les lieux du massacre et retrouve une chaussure de femme et un autographe que Bridget von Hammersmark a signé plus tôt pour un soldat allemand. Il comprend ainsi qu'elle était sur place.
</p><p>Au cours de la première, Landa fait essayer à von Hammersmark la chaussure qu'il a trouvée et, l'ayant ainsi confondue, l'étrangle. Il fait ensuite arrêter Raine, ainsi qu'un des Bâtards, Smithson Utivich (B. J. Novak), alors que Donowitz et Ulmer ont déjà pris place dans la salle, les chevilles cerclées d'explosifs. Il propose à Raine de ne pas s'interposer dans leur projet d'attentat au cinéma, et de se rendre en échange de l'immunité et d'une retraite dorée aux États-Unis (sur l'île de Nantucket) ainsi que de la citoyenneté américaine, le marché étant scellé avec un officier de l'OSS (Harvey Keitel) <i>via</i> une radio.
</p><p>Au cinéma, alors que le film est en train d'être projeté, Zoller s'éclipse et rejoint Shosanna dans la cabine de projection. Celle-ci le repousse une nouvelle fois et, alors qu'il s'irrite de son attitude, elle lui tire dessus. Il parvient à l'abattre également, avant de mourir. À la quatrième bobine, un film enregistré par Shosanna est projeté à l'écran, informant les personnes présentes qu'elles vont être tuées par une Juive. Au même moment, et après avoir soigneusement condamné toutes les sorties, Marcel met le feu au tas de films au nitrate cachés derrière l'écran, ce qui provoque l'embrasement du cinéma tout entier. Ulmer et Donowitz, s'étant échappés de la salle avant qu'elle ne soit fermée, accèdent à la loge où sont placés Hitler et Goebbels et les fusillent avant de tirer au hasard sur la foule paniquée, jusqu'à ce que les détonateurs placés dans leurs explosifs se déclenchent et soufflent l'ensemble du cinéma.
</p><p>Landa et un opérateur radio conduisent Raine et Utivich jusqu'aux lignes américaines et, conformément à l'accord passé, ils se rendent. Utivich menotte Landa pendant que Raine abat l'autre homme, à l'indignation du colonel. Conformément à son refus déjà exprimé de voir un nazi quitter son uniforme et ainsi masquer ses crimes, Raine lui grave profondément une croix gammée sur le front.
</p><p> 
</p>`,
      untreatedSynopsis: `<div class="mw-parser-output"><h3><span id="R.C3.A9sum.C3.A9_d.C3.A9taill.C3.A9"></span><span class="mw-headline" id="Résumé_détaillé">Résumé détaillé</span></h3>
<p><small>Note&#160;: sauf mention contraire, les précisions citées ici sont issues du <a href="/wiki/Script_(cin%C3%A9ma)" title="Script (cinéma)">script</a> officiel du film, disponible en ligne<sup id="cite_ref-1" class="reference"><a href="#cite_note-1"><span class="cite_crochet">[</span>1<span class="cite_crochet">]</span></a></sup>.</small>
</p>
<ul><li>Chapitre un&#160;: <i>Il était une fois… une France occupée par les Nazis</i><sup id="cite_ref-2" class="reference"><a href="#cite_note-2"><span class="cite_crochet">[</span>C 1<span class="cite_crochet">]</span></a></sup> (<i>Chapter 1: Once Upon a Time in Nazi-occupied France</i>)</li></ul>
<p>Pendant l'<a href="/wiki/Occupation_de_la_France_par_l%27Allemagne_pendant_la_Seconde_Guerre_mondiale" title="Occupation de la France par l&#39;Allemagne pendant la Seconde Guerre mondiale">occupation de la France</a>, en <a href="/wiki/1941" title="1941">1941</a>, une voiture allemande s'approche d'une ferme appartenant à Perrier Lapadite (<a href="/wiki/Denis_M%C3%A9nochet" title="Denis Ménochet">Denis Ménochet</a>) et ses filles près de <a href="/wiki/Nancy" title="Nancy">Nancy</a>. Le <a href="/wiki/Standartenf%C3%BChrer" title="Standartenführer">colonel</a> <a href="/wiki/Hans_Landa" title="Hans Landa">Hans Landa</a> (<a href="/wiki/Christoph_Waltz" title="Christoph Waltz">Christoph Waltz</a>) de la <a href="/wiki/Schutzstaffel" title="Schutzstaffel">SS</a>, surnommé <span class="citation">«&#160;Le Chasseur de Juifs&#160;»</span> interroge alors le fermier à propos de rumeurs faisant état d'une famille de Juifs qui serait cachée dans les environs. Après avoir fait pression sur lui, Landa lui extorque l'aveu qu'il cache bien cette famille de Juifs chez lui, puis ordonne à ses hommes de faire feu en direction du plancher sous lequel ils sont cachés. Toute la famille est assassinée, à l'exception de la fille aînée, Shosanna Dreyfus (<a href="/wiki/M%C3%A9lanie_Laurent" title="Mélanie Laurent">Mélanie Laurent</a>), qui parvient à s'enfuir sans que Landa la pourchasse, prétendant qu’elle mourra dans la nature.
</p>
<ul><li>Chapitre 2&#160;: <i><span class="lang-en" lang="en">Inglourious Basterds</span></i> (<i>Chapter 2: The Inglourious Basterds</i>)</li></ul>
<p>Au printemps <a href="/wiki/1944" title="1944">1944</a>, le lieutenant Aldo Raine (<a href="/wiki/Brad_Pitt" title="Brad Pitt">Brad Pitt</a>) du <a href="/wiki/1er_D%C3%A9tachement_du_service_sp%C3%A9cial" class="mw-redirect" title="1er Détachement du service spécial"><abbr class="abbr" title="Premier">1<sup>er</sup></abbr> détachement du service spécial</a> met sur pied un commando de huit soldats juifs-américains destinés à être parachutés derrière les lignes ennemies, afin de terroriser les soldats allemands. Opérant de manière furtive, ils prennent des groupes en embuscade et massacrent systématiquement les soldats de la <a href="/wiki/Wehrmacht" title="Wehrmacht">Wehrmacht</a>, sans oublier de les <a href="/wiki/Scalpation" title="Scalpation">scalper</a>. Ils sont connus sous le nom des <span class="citation">«&#160;Bâtards&#160;»</span> et ont pour politique de ne pas faire de prisonniers. Cependant, un soldat est reçu par <a href="/wiki/Adolf_Hitler" title="Adolf Hitler">Adolf Hitler</a> (<a href="/wiki/Martin_Wuttke" title="Martin Wuttke">Martin Wuttke</a>) et lui narre l'embuscade dans laquelle est tombée sa compagnie. Il raconte au <a href="/wiki/F%C3%BChrer" title="Führer">Führer</a> le sauvage assassinat d'un sergent à la <a href="/wiki/Batte_de_baseball" title="Batte de baseball">batte de baseball</a> par l'un des Bâtards, Donny Donowitz (<a href="/wiki/Eli_Roth" title="Eli Roth">Eli Roth</a>), surnommé l'<span class="citation">«&#160;Ours juif&#160;»</span>, et la raison pour laquelle ils lui ont laissé la vie sauve afin qu'il puisse témoigner auprès de ses supérieurs, après lui avoir gravé au couteau une <a href="/wiki/Croix_gamm%C3%A9e" class="mw-redirect" title="Croix gammée">croix gammée</a> sur le front.
</p>
<ul><li>Chapitre 3&#160;: <i>Une soirée allemande à Paris</i><sup id="cite_ref-3" class="reference"><a href="#cite_note-3"><span class="cite_crochet">[</span>C 2<span class="cite_crochet">]</span></a></sup> (<i>Chapter 3: A German Night in Paris</i>)</li></ul>
<p>En <time class="nowrap" datetime="1944-06" data-sort-value="1944-06">juin 1944</time>, Shosanna, sous l'identité d'Emmanuelle Mimieux, est devenue propriétaire d'un cinéma à Paris. Elle rencontre un soldat allemand féru de cinéma nommé <a href="/wiki/Frederick_Zoller" title="Frederick Zoller">Fredrick Zoller</a> (<a href="/wiki/Daniel_Br%C3%BChl" title="Daniel Brühl">Daniel Brühl</a>). Elle apprend plus tard qu'il est un <a href="/wiki/Sniper" title="Sniper">tireur d'élite embusqué</a> dont les exploits militaires en Italie l'ont fait connaître et ont été mis en valeur dans un <a href="/wiki/Propagande" title="Propagande">film de propagande</a> nazi, <i>La Fierté de la Nation</i>. Zoller, très attiré par Shosanna, convainc le docteur <a href="/wiki/Joseph_Goebbels" title="Joseph Goebbels">Joseph Goebbels</a> (<a href="/wiki/Sylvester_Groth" title="Sylvester Groth">Sylvester Groth</a>) d'organiser la <a href="/wiki/Avant-premi%C3%A8re" title="Avant-première">première</a> du film dans le cinéma de celle-ci. Shosanna réalise rapidement que la présence de nombreux hauts dignitaires nazis lui donne une occasion de venger sa famille et elle décide, avec l'aide de son amoureux noir Marcel (<a href="/wiki/Jacky_Ido" title="Jacky Ido">Jacky Ido</a>), d'organiser l'incendie de son cinéma à l'aide des nombreuses <a href="/wiki/Nitrocellulose" title="Nitrocellulose">pellicules au nitrate</a>, extrêmement inflammables, qu'elle y stocke. Alors qu'elle est conduite de force devant Goebbels, Shosanna voit réapparaître le colonel Landa, affecté à la protection de la soirée, sans que l'on sache s'il l'a reconnue.
</p>
<ul><li>Chapitre 4&#160;: <i><span class="lang-de" lang="de">Operation Kino</span></i> (<i>Chapter 4: Operation Kino</i>)</li></ul>
<p>Archie Hicox (<a href="/wiki/Michael_Fassbender" title="Michael Fassbender">Michael Fassbender</a>), lieutenant de l'<a href="/wiki/Arm%C3%A9e_de_terre_britannique" class="mw-redirect" title="Armée de terre britannique">armée britannique</a>, est convoqué par le général Ed Fenech (<a href="/wiki/Mike_Myers" title="Mike Myers">Mike Myers</a>) afin de participer à l’<i><span class="lang-de" lang="de">Operation Kino</span></i> (<span class="citation">«&#160;Opération cinéma&#160;»</span> en français), organisée par une <a href="/wiki/Espion" title="Espion">espionne</a> au service des Britanniques, la célèbre actrice allemande Bridget von Hammersmark (<a href="/wiki/Diane_Kruger" title="Diane Kruger">Diane Kruger</a>). L'opération consiste à éliminer les nombreux dignitaires et gradés <a href="/wiki/Nazisme" title="Nazisme">nazis</a> réunis pour la <a href="/wiki/Avant-premi%C3%A8re" title="Avant-première">première</a> de <i>La Fierté de la Nation</i> à Paris, en y infiltrant Hicox et deux des Bâtards se faisant passer pour des officiers de la <a href="/wiki/Wehrmacht" title="Wehrmacht">Wehrmacht</a> amis de von Hammersmark. Le rendez-vous de l'actrice et des trois espions, fixé dans la taverne d'un petit village situé à quelques kilomètres de Paris, tourne mal en raison de la présence fortuite d'un groupe de soldats allemands et du major Dieter Hellstrom (<a href="/wiki/August_Diehl" title="August Diehl">August Diehl</a>), de la <a href="/wiki/Gestapo" title="Gestapo">Gestapo</a>, qui remarque l'étrange accent et la façon toute britannique de commander à boire de Hicox. Leur <a href="/wiki/Impasse_mexicaine" title="Impasse mexicaine">impasse mexicaine</a>, puis leur affrontement, se soldent par la mort de toutes les personnes présentes, à l'exception de Bridget von Hammersmark, qui est blessée à la jambe dans la fusillade et peut fuir, aidée par Raine. Lorsque celui-ci l'interroge, il apprend que Hitler a également l'intention d'assister à la première et il décide de remplacer les trois espions morts par lui-même, Donny Donowitz et Omar Ulmer (<a href="/wiki/Omar_Doom" title="Omar Doom">Omar Doom</a>), en se faisant passer pour des amis italiens de l'actrice. Landa enquête sur les lieux du massacre et retrouve une chaussure de femme et un autographe que Bridget von Hammersmark a signé plus tôt pour un soldat allemand. Il comprend ainsi qu'elle était sur place.
</p>
<ul><li>Chapitre 5&#160;: <i>Vengeance en très gros plan</i><sup id="cite_ref-4" class="reference"><a href="#cite_note-4"><span class="cite_crochet">[</span>C 3<span class="cite_crochet">]</span></a></sup> (<i>Chapter 5: Revenge of the Giant Face</i>)</li></ul>
<p>Au cours de la première, Landa fait essayer à von Hammersmark la chaussure qu'il a trouvée et, l'ayant ainsi confondue, l'étrangle. Il fait ensuite arrêter Raine, ainsi qu'un des Bâtards, Smithson Utivich (<a href="/wiki/B._J._Novak" title="B. J. Novak">B. J. Novak</a>), alors que Donowitz et Ulmer ont déjà pris place dans la salle, les chevilles cerclées d'<a href="/wiki/Explosif" title="Explosif">explosifs</a>. Il propose à Raine de ne pas s'interposer dans leur projet d'attentat au cinéma, et de se rendre en échange de l'<a href="/wiki/Amnistie" title="Amnistie">immunité</a> et d'une retraite dorée aux <a href="/wiki/%C3%89tats-Unis" title="États-Unis">États-Unis</a> (sur l'île de <a href="/wiki/Nantucket" title="Nantucket">Nantucket</a>) ainsi que de la citoyenneté américaine, le marché étant scellé avec un officier de l'OSS (<a href="/wiki/Harvey_Keitel" title="Harvey Keitel">Harvey Keitel</a>) <i><span class="lang-la" lang="la">via</span></i> une radio.
</p><p>Au cinéma, alors que le film est en train d'être projeté, Zoller s'éclipse et rejoint Shosanna dans la cabine de <a href="/wiki/Projection_cin%C3%A9matographique" title="Projection cinématographique">projection</a>. Celle-ci le repousse une nouvelle fois et, alors qu'il s'irrite de son attitude, elle lui tire dessus. Il parvient à l'abattre également, avant de mourir. À la quatrième <a href="/wiki/Projection_cin%C3%A9matographique" title="Projection cinématographique">bobine</a>, un film enregistré par Shosanna est projeté à l'écran, informant les personnes présentes qu'elles vont être tuées par une Juive. Au même moment, et après avoir soigneusement condamné toutes les sorties, Marcel met le feu au tas de films au nitrate cachés derrière l'écran, ce qui provoque l'embrasement du cinéma tout entier. Ulmer et Donowitz, s'étant échappés de la salle avant qu'elle ne soit fermée, accèdent à la loge où sont placés Hitler et Goebbels et les fusillent avant de tirer au hasard sur la foule paniquée, jusqu'à ce que les détonateurs placés dans leurs explosifs se déclenchent et soufflent l'ensemble du cinéma.
</p><p>Landa et un opérateur radio conduisent Raine et Utivich jusqu'aux lignes américaines et, conformément à l'accord passé, ils se rendent. Utivich menotte Landa pendant que Raine abat l'autre homme, à l'indignation du colonel. Conformément à son refus déjà exprimé de voir un nazi quitter son uniforme et ainsi masquer ses crimes, Raine lui grave profondément une croix gammée sur le front.
</p><p><br />
</p>
<div class="mw-references-wrap"><ol class="references">
<li id="cite_note-1"><span class="mw-cite-backlink noprint"><a href="#cite_ref-1">↑</a> </span><span class="reference-text"><span class="ouvrage" id="2008"><abbr class="abbr indicateur-langue" title="Langue : anglais">(en)</abbr> <span lang="en"><a rel="nofollow" class="external text" href="http://www.imsdb.com/scripts/Inglourious-Basterds.html">«&#160;<cite style="font-style:normal;">Script d’<i>Inglourious Basterds</i></cite>&#160;»</a></span>, sur <span class="italique">The Internet Movie Script Database</span>, <time class="nowrap" datetime="2008-07" data-sort-value="2008-07">juillet 2008</time> <small style="line-height:1em;">(consulté le <time class="nowrap" datetime="2011-09-25" data-sort-value="2011-09-25">25 septembre 2011</time>)</small></span></span>
</li>
</ol></div><p><br /><span class="error mw-ext-cite-error" lang="fr" dir="ltr">Erreur de référence : Des balises <code>&lt;ref&gt;</code> existent pour un groupe nommé « C », mais aucune balise <code>&lt;references group="C"/&gt;</code> correspondante n’a été trouvée</span></p></div>`,
    };
    const film = await findNewMovie("Inglourious Basterds");
    expect(film).toStrictEqual(result);
  });
});
