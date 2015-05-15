namespace BI.Biopacs.Core.BusinessServices.Tests
{
    using System;
    using System.Collections.Generic;

    using BI.Biopacs.Core.BusinessDomain;
    using BI.Biopacs.Core.BusinessDomain.Enum;
    using BI.Biopacs.Core.BusinessDomain.UMS;
    using BI.Biopacs.Core.BusinessInterfaces.AuditTrail;
    using BI.Biopacs.Core.BusinessInterfaces.Repositories;
    using BI.Biopacs.Core.BusinessInterfaces.Services;
    using BI.Biopacs.Core.BusinessInterfaces.UMS;
    using BI.Biopacs.Core.BusinessServices.UMS;
    using BI.Biopacs.Core.Configuration;
    using BI.Biopacs.Core.Configuration.Interfaces;
    using BI.Biopacs.Core.Configuration.Persistence;
    using BI.Biopacs.Core.Database.Repositories;
    using BI.Biopacs.Core.Framework.Helpers;

    using Moq;

    using NUnit.Framework;

    /// <summary>
    /// Unit test for <see cref="ProjectDocumentService"/> class
    /// </summary>
    [TestFixture]
    public class ProjectDocumentServiceTests
    {
        private const string TestFileName = "FileName.pdf";
        private const string TestDescription = "description";
        
        private readonly IEnumerable<ProjectSiteModel> _authorizedSites = new List<ProjectSiteModel>();
        private readonly PersonModel _testPerson = new PersonModel { ID = 1, FirstName = "Test", LastName = "Person" };
        private readonly Session _userSession = new Session(3456, DateTime.MaxValue, "identifier");
        private readonly DateTime _dateTime = DateTime.Now;
        
        private IProjectDocumentService _documentService;
        private Mock<IDBProjectDocumentRepository> _mockProjectDocumentRepository;
        private Mock<IDBProjectDocumentFileRepository> _mockProjectDocumentFileRepository;
        private Mock<IDBStorageRepository> _mockStorageRepository;
        private ProjectModel _testProject;

        [SetUp]
        public void Setup()
        {
            // Create Mock Repositories
            _mockProjectDocumentRepository = new Mock<IDBProjectDocumentRepository>();
            _mockProjectDocumentFileRepository = new Mock<IDBProjectDocumentFileRepository>();
            _mockStorageRepository = new Mock<IDBStorageRepository>();

            // Create Mock Session provider
            var mockSessionProvider = new Mock<ISessionProvider>();
            mockSessionProvider.Setup(sp => sp.GetSession()).Returns(() => _userSession);

            // Create Person Service mock object
            var mockPersonService = new Mock<IPersonService>();
            mockPersonService.Setup(ps => ps.GetPerson(It.IsAny<int>())).Returns(_testPerson);

            var configurationManager = new Mock<IConfigurationManager>();
            configurationManager.Setup(cm => cm.GetConfigurationValueAsInt(It.IsAny<string>(), It.IsAny<string>())).Returns(1);

            _documentService = new ProjectDocumentService(_mockProjectDocumentRepository.Object, _mockProjectDocumentFileRepository.Object, _mockStorageRepository.Object, mockSessionProvider.Object, mockPersonService.Object, configurationManager.Object);

            _testProject = new ProjectModel
                               {
                                   Client = new ClientModel
                                           {
                                               ID = 123,
                                               ContactList = new List<ContactInformationModel>(),
                                               IsDeleted = false,
                                               IsDirty = false,
                                               IsNew = true,
                                               Name = "Client Name"
                                           },
                                   Code = "Project Code",
                                   Description = "Description",
                                   ActivationDate = DateTime.Now,
                                   AvailableRoles = new List<SiteRoleModel>(),
                                   ID = 123456678,
                                   Name = "Project Name",
                                   ProjectSites = new List<ProjectSiteModel>()
                               };
        }

        [TearDown]
        public void TearDown()
        {
            _mockProjectDocumentRepository = null;
            _mockProjectDocumentFileRepository = null;
            _mockStorageRepository = null;
            _documentService = null;
        }

        [Test]
        public void TestConstructor()
        {
            var projectDocumentRepository = new DBProjectDocumentRepository();
            var projectDocumentFileRepository = new DBProjectDocumentFileRepository(new PathHelper());
            var storageRepository = new DBStorageRepository();

            var validator = new SessionValidator();
            var sessionProvider = new SessionProvider(validator);

            var personRepository = new DBPersonRepository();
            var salutationRepository = new DBSalutationRepository();
            var userGroupRepository = new DBUserGroupRepository();
            var personService = new PersonService(personRepository, salutationRepository, userGroupRepository);

            var configurationRepository = new DBConfigurationRepository();
            var configurationManager = new ConfigurationManager(configurationRepository);

            var documentService = new ProjectDocumentService(projectDocumentRepository, projectDocumentFileRepository, storageRepository, sessionProvider, personService, configurationManager);

            Assert.AreNotEqual(null, documentService);
        }

        [Test]
        public void TestGetProjectDocumentList()
        {
            var testDocument = ProjectDocumentModel.CreateNew(TestFileName, TestDescription, _testPerson, _dateTime, _testProject, _authorizedSites);
            var testList = new List<ProjectDocumentModel>
                               {
                                   new ProjectDocumentModel(1, testDocument),
                                   new ProjectDocumentModel(2, testDocument)
                               };
            
            _mockProjectDocumentRepository.Setup(pdr => pdr.GetProjectDocumentList(It.IsAny<ProjectModel>()))
                                          .Returns(testList);
                                          
            var actualList = _documentService.GetProjectDocumentList(_testProject);

            CollectionAssert.AreEqual(testList, actualList);
        }

        [Test]
        public void TestCreate()
        {
            var mockStorageRepositoryModel = new Mock<StorageRepositoryModel>();
            _mockStorageRepository.Setup(sr => sr.GetProjectStorageRepository(It.IsAny<ProjectModel>(), It.IsAny<GeographicalLocationEnum>())).Returns(mockStorageRepositoryModel.Object);

            bool documentWasUploadToProjectDocumentFileRepositoryFlag = false;
            _mockProjectDocumentFileRepository.Setup(pdfr => pdfr.Upload(It.IsAny<ProjectDocumentModel>(), It.IsAny<StorageRepositoryModel>()))
                                              .Callback(() =>
                                                  {
                                                      documentWasUploadToProjectDocumentFileRepositoryFlag = true;
                                                  });

            bool documentWasCreatedInProjectDocumentRepositoryFlag = false;
            _mockProjectDocumentRepository.Setup(
                pdr => pdr.Create(It.IsAny<ProjectDocumentModel>(), It.IsAny<IAuditContext>()))
                                          .Callback(() =>
                                              {
                                                  documentWasCreatedInProjectDocumentRepositoryFlag = true;
                                              });

            _documentService.Create(TestFileName, TestDescription, _testProject, _authorizedSites);

            Assert.True(documentWasUploadToProjectDocumentFileRepositoryFlag);
            Assert.True(documentWasCreatedInProjectDocumentRepositoryFlag);
        }

        [Test]
        public void TestDelete()
        {
            bool documentWasDeletedInProjectDocumentFileRepositoryFlag = false;
            _mockProjectDocumentFileRepository.Setup(pdfr => pdfr.Delete(It.IsAny<ProjectDocumentModel>()))
                                              .Callback(() =>
                                              {
                                                  documentWasDeletedInProjectDocumentFileRepositoryFlag = true;
                                              });

            bool documentWasDeletedInProjectDocumentRepositoryFlag = false;
            _mockProjectDocumentRepository.Setup(pdr => pdr.Delete(It.IsAny<ProjectDocumentModel>(), It.IsAny<IAuditContext>()))
                                          .Callback(() =>
                                          {
                                              documentWasDeletedInProjectDocumentRepositoryFlag = true;
                                          });

            var testDocument = ProjectDocumentModel.CreateNew(TestFileName, TestDescription, _testPerson, _dateTime, _testProject, _authorizedSites);
            _documentService.Delete(testDocument);

            Assert.True(documentWasDeletedInProjectDocumentFileRepositoryFlag);
            Assert.True(documentWasDeletedInProjectDocumentRepositoryFlag);
        }

        #region Null arguments tests

        [Test]
        [ExpectedException(typeof(ArgumentNullException))]
        [TestCase(true, false, false, false, false, false)]
        [TestCase(false, true, false, false, false, false)]
        [TestCase(false, false, true, false, false, false)]
        [TestCase(false, false, false, true, false, false)]
        [TestCase(false, false, false, false, true, false)]
        [TestCase(false, false, false, false, false, true)]
        public void TestConstructorWithNullArguments(bool isNullDocumentRepository, bool isNullDocumentFileRepository, bool isNullstorageRepository, bool isNullsessionProvider, bool isNullpersonService, bool isNullconfigurationManager)
        {
            var projectDocumentRepository = isNullDocumentRepository ? null : new DBProjectDocumentRepository();

            var projectDocumentFileRepository = isNullDocumentFileRepository ? null : new DBProjectDocumentFileRepository(new PathHelper());

            var storageRepository = isNullstorageRepository ? null : new DBStorageRepository();

            var validator = new SessionValidator();
            var sessionProvider = isNullsessionProvider ? null : new SessionProvider(validator);

            var personRepository = new DBPersonRepository();
            var salutationRepository = new DBSalutationRepository();
            var userGroupRepository = new DBUserGroupRepository();
            var personService = isNullpersonService ? null : new PersonService(personRepository, salutationRepository, userGroupRepository);

            var configurationRepository = new DBConfigurationRepository();
            var configurationManager = isNullconfigurationManager ? null : new ConfigurationManager(configurationRepository);

            var documentService = new ProjectDocumentService(projectDocumentRepository, projectDocumentFileRepository, storageRepository, sessionProvider, personService, configurationManager);
        }

        [Test]
        [ExpectedException(typeof(ArgumentNullException))]
        public void TestGetProjectDocumentListWithNullArgument()
        {
            _documentService.GetProjectDocumentList(null);
        }

        [Test]
        [ExpectedException(typeof(ArgumentNullException))]
        [TestCase(true, false, false, false)]
        [TestCase(false, true, false, false)]
        [TestCase(false, false, true, false)]
        [TestCase(false, false, false, true)]
        public void TestCreateWithNullArguments(bool isNullFileName, bool isNullDescription, bool isNullProject, bool isNullAuthorizedSites)
        {
            _documentService.Create(isNullFileName ? null : TestFileName,
                                    isNullDescription ? null : TestDescription, 
                                    isNullProject ? null : _testProject,
                                    isNullAuthorizedSites ? null : _authorizedSites);
        }

        [Test]
        [ExpectedException(typeof(ArgumentNullException))]
        public void TestDeleteWithNullArguments()
        {
            _documentService.Delete(null);
        }

        #endregion Null arguments tests

        #region Invalid arguments tests

        [Test]
        [ExpectedException(typeof(ArgumentException))]
        [TestCase(true, false)]
        [TestCase(false, true)]
        public void TestCreateWithInvalidArguments(bool isEmptyFileName, bool isTooLargeDescription)
        {
            _documentService.Create(isEmptyFileName ? string.Empty : TestFileName,
                                    isTooLargeDescription ? new string('M', 258) : TestDescription,
                                    _testProject,
                                    _authorizedSites);
        }

        #endregion Invalid arguments tests
    }
}
