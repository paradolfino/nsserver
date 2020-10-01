import Utils from "./utilities.mjs";
export default class Engine
{
    static ENUMS = {
        Privileges: {
            NationAdmin: 0,
            PostToNationForum: 1,
            EditNationName: 2,
            EditNationDesc: 3,
            EditNationLaws: 4,
            EditNationDocuments: 5,
            EditNationRanks: 6,
            PromoteDemote: 7,
            AddRemoveMember: 8
        },
        Entities: {}
    }

    static DICTIONARY = {
        Entities: {},
        ResponseTypes: {
            Success: 0,
            Error: 1
        }
    }

    static FUNCTIONS = {
        FindEntityByID(entity, id, parameterName = null)
        {
            let mapped = Engine.ENUMS.Entities[entity];
            let param = mapped.Name + "ID";

            if (parameterName != null)
            {
                param = parameterName;
            }

            return Engine.FakeDB[mapped.Pluralized].find(item => item[param] == id);
        },
        CreateResponse(Status, Data)
        {
            return new ResponseObject({Status, Data});
        }
    }

    static FakeDB = {
        Accounts: [],
        Members: [],
        Titles: [],
        Nations: [],
        Ranks: [],
        ForumThreads: [],
        ForumThreadReplies: [],
        ForumCategories: [],
        Laws: [],
        Documents: [],
        Sessions: []
    }


    /////
    static async Create(entity, data)
    {
        //ajax
        let mapped = Engine.ENUMS.Entities[entity];
        let obj = new mapped.Type(data);
        Engine.FakeDB[mapped.Pluralized].push(obj);
        console.log(obj);
        let response = Engine.CreateResponse(Engine.DICTIONARY.ResponseTypes.Success, obj);
        return response;
    }

    static async Update(entity, id, data)
    {
        let obj = Engine.FUNCTIONS.FindEntityByID(entity, id);
        let response;
        if (obj)
        {
            let idx = Engine.FakeDB[entity.Name].indexOf(obj);
            Engine.FakeDB[entity.Name][idx] = data;

            response = Engine.CreateResponse(Engine.DICTIONARY.ResponseTypes.Success, obj);
        }
        else
        {
            response = Engine.CreateResponse(Engine.DICTIONARY.ResponseTypes.Error);
        }
        return response;
    }

    static async Read(entity, id)
    {
        let obj = Engine.FUNCTIONS.FindEntityByID(entity, id);
        let response = Engine.CreateResponse(Engine.DICTIONARY.ResponseTypes.Success, obj);
        return response;
    }

    static async Destroy(entity, id)
    {
        let mapped = Engine.ENUMS.Entities[entity];
        Engine.FakeDB[entity.Name] = Engine.FakeDB[entity.Name].filter((item) => item[mapped.Name + "ID"] != id);

        let response = Engine.CreateResponse(Engine.DICTIONARY.ResponseTypes.Success);
        return response;
    }

    static async Authenticate(id)
    {
        let session = Engine.FUNCTIONS.FindEntityByID(10, id, "AccountID");
        let isNew = false;
        if (session)
        {
            let d1 = session.DateCreated;
            let d2 = new Date();
            let diff = Math.abs(d1.getTime() - d2.getTime());
            diff = diff / (1000 * 60 * 60 * 24);

            if (diff > 30)
            {
                isNew = true;
            }
        }
        else
        {
            isNew = true;
        }

        if (isNew == true)
        {
            session = await Engine.Create(Engine.DICTIONARY.Entities.Session, {AccountID: id});
        }

        let response;

        if (session)
        {
            response = Engine.CreateResponse(Engine.DICTIONARY.ResponseTypes.Success, session);
        }
        else
        {
            response = Engine.CreateResponse(Engine.DICTIONARY.ResponseTypes.Error, "Could not create session")
        }
        return session;
    }

    static async Login(data)
    {

    }

    static async Logout()
    {

    }

    static async Register(data)
    {
        let response;
        try {
            let existingAccount = Engine.FUNCTIONS.FindEntityByID(Engine.DICTIONARY.Entities.Account, data.Email, "Email");
            if (existingAccount)
            {
                response = Engine.CreateResponse(Engine.DICTIONARY.ResponseTypes.Error, "Email already exists");
            }
            else
            {
                let account = await Engine.Create(Engine.DICTIONARY.Entities.Account, data);
                if (account)
                {
                    let member = await Engine.Create(Engine.DICTIONARY.Entities.Member, {MemberID: account.Data.MemberID});
                    let session = await Engine.Authenticate(account.Data.AccountID);
                    if (session)
                    {
                        let obj = {Member: member.Data, Session: session.Data};
                        response = Engine.CreateResponse(Engine.DICTIONARY.ResponseTypes.Success, obj);
                    }
                    else
                    {
                        response = Engine.CreateResponse(Engine.DICTIONARY.ResponseTypes.Error, "Could not register account");
                    }
                }
            }
            
        } catch (e) {
            response = Engine.CreateResponse(Engine.DICTIONARY.ResponseTypes.Error, e);
        }

        return response;
    }

    static async Deactivate(data)
    {

    }

    /////
    
    static CreateResponse(Status, Data)
    {
        return Engine.FUNCTIONS.CreateResponse(Status, Data);
    }

    static GetMappedEntity(Type, Name)
    {
        let Pluralized = [];
        if (Name[Name.length - 1] == "y")
        {
            Pluralized = Name.split("");
            Pluralized.pop();
            Pluralized = Pluralized.join("") + "ies";
        }
        else
        {
            Pluralized = Name + "s";
        }

        return {Type: Type, Name: Name, Pluralized: Pluralized}
    }

    static async Init()
    {
        Engine.ENUMS.Entities = {
            0: Engine.GetMappedEntity(Account, "Account"),
            1: Engine.GetMappedEntity(Member, "Member"),
            2: Engine.GetMappedEntity(Title, "Title"),
            3: Engine.GetMappedEntity(Nation, "Nation"),
            4: Engine.GetMappedEntity(Rank, "Rank"),
            5: Engine.GetMappedEntity(ForumThread, "ForumThread"),
            6: Engine.GetMappedEntity(ForumThreadReply, "ForumThreadReply"),
            7: Engine.GetMappedEntity(ForumCategory, "ForumCategory"),
            8: Engine.GetMappedEntity(Law, "Law"),
            9: Engine.GetMappedEntity(Document, "Document"),
            10: Engine.GetMappedEntity(Session, "Session")
        }

        Engine.DICTIONARY.Entities = Object.assign({}, ...Object.entries(Engine.ENUMS.Entities).map(([a,b]) => ({ [b.Name]: a })));
        
        Engine.Seed();
    }

    static async Seed()
    {
        //create account/member
        let testUser = await Engine.Register({Email: "test@test.com", Password: "password"});

        //create forum category test
        let category = await Engine.Create(Engine.DICTIONARY.Entities.ForumCategory, {});

        //create post by test user
        let post = await Engine.Create(Engine.DICTIONARY.Entities.ForumThread, {ForumCategoryID: category.Data.ForumCategoryID, MemberID: testUser.Data.Member.MemberID});

        //create reply
        let reply = await Engine.Create(Engine.DICTIONARY.Entities.ForumThreadReply, {ForumThreadID: post.Data.ForumThreadID, MemberID: testUser.Data.Member.MemberID});
    }
}

//utility classes
class ResponseObject
{
    static ResponseStatus = {
        0: "Ok",
        1: "Error"
    }
    constructor(data)
    {
        this.Status = ResponseObject.ResponseStatus[data.Status];
        this.Data = data.Data;
    }
}

//entity classes
class Session
{
    constructor(data)
    {
        this.SessionID = data.SessionID || Utils.GetNewGUID();
        this.AccountID = data.AccountID || null;
        this.DateCreated = data.DateCreated || new Date();
    }
}

class Account
{
    constructor(data)
    {
        this.AccountID = data.AccountID || Utils.GetNewGUID();
        this.MemberID = data.MemberID || Utils.GetNewGUID();
        this.Email = data.Email || null;
        this.Password = Utils.FakeEncrypt(data.Password) || Utils.GetNewPassword();
    }
}

class Member
{
    constructor(data)
    {
        this.MemberID = data.MemberID || Utils.GetNewGUID();
        this.NationID = data.NationID || null;
        this.PrimaryTitleID = data.PrimaryTitleID || null;
        this.Name = data.Name || "New Member";
        this.AvatarURL = data.AvatarURL || "";
        this.Titles = data.Titles || []; //list of title objects that contain name and id
        this.Prestige = data.Prestige || 0;
        this.DateCreated = data.DateCreated || new Date();
    }
}

class Title
{
    constructor(data)
    {
        this.TitleID = data.TitleID || Utils.GetNewGUID();
        this.NationID = data.NationID || null;
        this.Level = data.Level || 1; //0 - non leveled, 1 - tribe level, 2 - barony level, 3 - county level, 4 - duchy level, 5 - kingdom level, 6 - empire level
        this.Privileges = data.Privileges || []; //enum
        this.Name = data.Name || "New Title";
        this.DateCreated = data.DateCreated || new Date();
        this.Denonym = data.Denonym || "Chieftain"; //what is the title holder called?
    }
}

class Rank
{
    constructor(data)
    {
        this.RankID = data.RankID || Utils.GetNewGUID();
        this.NationID = data.NationID || null;
        this.CanDestroy = typeof(data.CanDestroy) == 'boolean' ? data.CanDestroy : false;
        this.Name = data.Name || "New Rank";
        this.Order = data.Order || 0; //nation admin
        this.Privileges = data.Privileges || [Engine.ENUMS.Privileges.NationAdmin]; //admin privileges
    }
}

class Nation
{
    constructor(data)
    {
        this.NationID = data.NationID || Utils.GetNewGUID();
        this.PrimaryTitleID = data.PrimaryTitleID || null;
        this.Name = data.Name || "New Nation";
        this.AvatarURL = data.AvatarURL || "";
        this.Titles = data.Titles || [new Title(this)];
        this.Prestige = data.Prestige || 0;
        this.DateCreated = data.DateCreated || new Date();
        this.Ranks = data.Ranks || [new Rank({NationID: this.NationID, Name: "Admin"}), new Rank({NationID: this.NationID, Order: 1, Privileges: [Engine.ENUMS.Privileges.PostToNationForum]})]; //list of rank objects that contain name and id

        if (this.PrimaryTitleID == null)
        {
            this.PrimaryTitleID = this.Titles[0].TitleID;
        }
    }
}

class Law
{
    constructor(data)
    {
        this.LawID = data.LawID || Utils.GetNewGUID();
        this.NationID = data.NationID || null;
        this.DateCreated = data.DateCreated || new Date();
    }
}

class Document
{
    constructor(data)
    {
        this.DocumentID = data.DocumentID || Utils.GetNewGUID();
        this.NationID = data.NationID || null;
        this.DateCreated = data.DateCreated || new Date();
    }
}

class ForumCategory
{
    constructor(data)
    {
        this.ForumCategoryID = data.ForumCategoryID || Utils.GetNewGUID();
        this.NationID = data.NationID || null;
        this.DateCreated = data.DateCreated || new Date();
        this.Name = data.Name || "Default Category Name";
        this.Description = data.Description || "Default Category Description";
    }
}

class ForumThread
{
    constructor(data)
    {
        this.ForumThreadID = data.ForumThreadID || Utils.GetNewGUID();
        this.ForumCategoryID = data.ForumCategoryID || null;
        this.MemberID = data.MemberID || null; //author
        this.Pinned = typeof(data.Pinned) == 'boolean' ? data.Pinned : false;
        this.Subject = data.Subject || "Default Subject";
        this.Content = data.Content || "Default Content";
        this.VisibleTo = data.VisibleTo || []; //which ranks visible to. if array has none, all can see
        this.DateCreated = data.DateCreated || new Date();
    }
}

class ForumThreadReply
{
    constructor(data)
    {
        this.ForumThreadReplyID = data.ForumThreadReplyID || Utils.GetNewGUID();
        this.ForumThreadID = data.ForumThreadID || null;
        this.MemberID = data.MemberID || null; //author
        this.Content = data.Content || "Default Reply";
        this.DateCreated = data.DateCreated || new Date();
    }
}