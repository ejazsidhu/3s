import { Component, OnInit, TemplateRef, ViewChild, OnDestroy, HostListener, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
// import { HomeService } from "../services/home.service";
import { SessionService } from "../services/session.service";
import { HeaderService, HomeService } from '@projectModules/app/services';
import { environment } from "@environments/environment";
import { Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ISlimScrollOptions, SlimScrollEvent } from 'ngx-slimscroll';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DndDropEvent } from "ngx-drag-drop";
import * as _ from "underscore";

import { ToastrService } from "ngx-toastr";
// import { HomeService } from 'src/app/list/services/home.service';

@Component({
	selector: 'video-huddle-list-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

	public Filters: filters = {};
	public objHuddleType = 0;
	public ModalRefs: Modals;
	public Inputs: GeneralInputs;
	public page;
	public Loadings;
	public HuddlesAndFolders;
	public foldersExpanded: boolean;
	public DetailedHuddle;
	public SearchString;
	public subscriptionRefs;
	public EditableFolder;
	public PipeTrigger;
	public FoldersTreeData;
	public MovableItem;
	public params: any = {};
	public queryParamsObj: any = {};
	public DeletableItem;
	public ScrollVal: number = 500;
	private searchInput: Subject<string> = new Subject();
	public colors;
	public permissions: any = {};
	public header_data;
	public translation: any = {};
	subscription: Subscription;
	public userAccountLevelRoleId: number | string = null;
	// numbers: number[] = [];
	public showSkeleton = true;
	opts: ISlimScrollOptions;
	scrollEvents: EventEmitter<SlimScrollEvent>;
	@ViewChild('participentsDetailsModal', { static: false }) participentsDetailsModal;
	// @ViewChild("searchString", {static: false}) searchString;
	assessment_permissions;
	public assessment_huddle_active;
	constructor(private fullRouter: Router, private ARouter: ActivatedRoute, private headerService: HeaderService, private sessionService: SessionService, private toastr: ToastrService, private modalService: BsModalService, private homeService: HomeService) {
		this.subscription = this.headerService.languageTranslation$.subscribe(languageTranslation => {
			this.translation = languageTranslation;
			this.Inputs = { NewFolderName: "", Confirmation: "", ConfirmationKey: this.translation.Huddle_confirmation_bit };
		});
	}

	@HostListener('window:scroll', ['$event'])
	onScroll(event) {
		// setTimeout(()=>{
		if (this.Loadings.isNextPageLoading) {

			let doc = document.documentElement;
			let currentScroll = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

			var d = document.documentElement;
			var offset = window.innerHeight + window.pageYOffset //d.scrollTop + window.innerHeight;
			var height = d.offsetHeight;
			if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 2) {
				window.scroll(0, currentScroll - 50);
			}

		}
		else if (!this.Loadings.isNextPageLoading && this.HuddlesAndFolders && this.HuddlesAndFolders.huddles.length < this.HuddlesAndFolders.total_huddles) {

			setTimeout(() => {

				let doc = document.documentElement;
				let currentScroll = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

				var d = document.documentElement;
				var offset = d.scrollTop + window.innerHeight;
				var height = d.offsetHeight;

				// if (offset === height)
				if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 2) {
					this.LoadNextPage(this.params.folder_id, currentScroll);
					window.scroll(0, document.body.offsetHeight - this.getPercentage(document.body.offsetHeight, 8));
				}


			}, 100);

		} else {
			//window.scroll(0,document.body.offsetHeight-this.getPercentage(document.body.offsetHeight, 8));
		}
		// }, 100);



	}

	ngOnInit() {
		this.scrollEvents = new EventEmitter<SlimScrollEvent>();
		this.opts = {
			position: 'right', // left | right
			barBackground: '#C9C9C9', // #C9C9C9
			barOpacity: '0.8', // 0.8
			barWidth: '10', // 10
			barBorderRadius: '20', // 20
			barMargin: '0', // 0
			gridBackground: '#D9D9D9', // #D9D9D9
			gridOpacity: '1', // 1
			gridWidth: '0', // 2
			gridBorderRadius: '20', // 20
			gridMargin: '0', // 0
			alwaysVisible: true, // true
			visibleTimeout: 1000, // 1000
		}
		this.header_data = this.headerService.getStaticHeaderData();
		this.userAccountLevelRoleId = this.header_data.user_permissions.roles.role_id;
		// this.translation = this.header_data.language_translation; // changed to observable streams
		//debugger;
		this.assessment_huddle_active = this.header_data.assessment_huddle_active;
		this.initVars();
		this.GetParams();
		this.SubscribeSearch();
		this.Assessment_huddle_permissions();
		// console.log(this.header_data);     
	}

	private SubscribeSearch() {

		this.searchInput
			.pipe(debounceTime(1000), distinctUntilChanged())
			.subscribe(value => {

				// console.log('in value: ', value);
				this.search();
			});

		// fromEvent(document.getElementById('searchString'), 'keyup')
		// .pipe(map((x:any) => {x.target.value;}))
		// .pipe(debounceTime(1000))
		// .subscribe((data)=>{

		//   this.search();

		// });
	}

	public OnSearchChange(event) {
		this.searchInput.next(event);

		if (this.SearchString == '') {
			// this.sessionService.SetItem('huddle_sort', 3);
			this.Loadings.isSearchEmpty = true;
		} else {
			// this.sessionService.SetItem('huddle_sort', 0);
		}
	}

	private initVars(preserve_params?, preserve_search_string?) {
		this.LoadFilterSettings();
		this.page = 1;
		this.Loadings = {};
		this.foldersExpanded = true;

		if (!preserve_search_string) {
			this.SearchString = "";
		}

		this.FoldersTreeData = {};
		// this.LoadNextPage();
		this.subscriptionRefs = {};
		this.EditableFolder = {};
		this.PipeTrigger = false;
		let sessionData: any = this.headerService.getStaticHeaderData();
		this.permissions.allow_move = sessionData.user_current_account.users_accounts.folders_check == 1;
		// ({folders_check:this.permissions.allow_move}=sessionData.user_current_account.user_accounts);
		this.Loadings.isNextPageLoading;
		if (!preserve_params) {
			this.params = {};
		}

		// let perms:any = {};
		if (this.HuddlesAndFolders != void 0)
			if (void 0 != this.HuddlesAndFolders.huddle_create_permission || this.HuddlesAndFolders.folder_create_permission != void 0) {

				let copy = JSON.parse(JSON.stringify(this.HuddlesAndFolders));
				this.HuddlesAndFolders = {};
				({
					huddle_create_permission: this.HuddlesAndFolders.huddle_create_permission,
					folder_create_permission: this.HuddlesAndFolders.folder_create_permission
				} = copy);

				copy = {};

			} else {
				this.HuddlesAndFolders = {};
			}



		this.colors = this.headerService.getColors();

	}

	private LoadFilterSettings() {

		this.Filters = {};
		this.ModalRefs = { newFolderModal: "" };
		//  this.sub_filters = "0";

		this.Filters.type = this.NVals(this.sessionService.GetItem("huddle_type"), ["0", "1", "2", "3"], "0");
		this.Filters.layout = this.NVals(this.sessionService.GetItem("huddle_layout"), ["0", "1"], "0");
		this.Filters.sort_by = this.NVals(this.sessionService.GetItem("huddle_sort"), ["0", "1", "2", "3"], "3");
		// if (this.Filters.type == 3 && !this.Assessment_huddle_permissions()) {
		// 	// this.Filters.type=0;
		// 	this.DigestFilters("huddle_type", "0");
		// }
	}


	private GetParams() {

		this.ARouter.params.subscribe((p) => {

			if (p.folder_id) {
				this.queryParamsObj.folderId = p.folder_id;
				this.initVars();
				this.params = p;
				this.LoadNextPage(p.folder_id);
				let obj: any = {
					folder_id: p.folder_id
				};
				let sessionData: any = this.headerService.getStaticHeaderData();
				({
					User: {
						id: obj.user_id
					},
					accounts: {
						account_id: obj.account_id
					}
				} = sessionData.user_current_account);

				let ref = this.homeService.GetBreadcrumbs(obj).subscribe((data: any) => {

					if (void 0 != data.success && data.success == -1) {

						//this.toastr.info(data.message);
						setTimeout(() => {
							this.fullRouter.navigate(['/list']);
						}, 2000);

						return;

					}

					// this.homeService.Breadcrumbs.emit(data);
					this.homeService.updateBreadcrumb(data)

				});
			} else {
				this.LoadNextPage(false);
				// this.homeService.Breadcrumbs.emit([]);
				this.homeService.updateBreadcrumb([])

			}

			this.params = p;

		});

	}

	// public GetFolderList(){

	// 	let sessionData = this.headerService.getStaticHeaderData();
	// 	let obj = {

	// 	};

	// 	let ref = this.homeService.GetFolderList().subscribe((d)=>{

	// 		console.log(d);

	// 	});

	// }

	private getPercentage(n, what) {

		return (what / 100) * n;

	}

	private NVals(src, possible_values, default_value) {

		return (possible_values.indexOf(src) !== -1) ? src : default_value;

	}

	public OnHuddleClick(huddle) {

		// let str = environment.baseUrl + "/Huddles/view/" + huddle.huddle_id;
		// location.href = str;
		let str = '';
		if (huddle.huddle_type == 'Assessment') {
			str = "/video_huddles/assessment/" + huddle.huddle_id + '/huddle/details';
		} else {
			str = "/video_huddles/huddle/details/" + huddle.huddle_id;
		}
		this.fullRouter.navigate([str]);
	}

	private DealWithFakeHuddles(flag) {

		if (!this.HuddlesAndFolders || !this.HuddlesAndFolders.huddles) return;

		for (let i = 0; i < 10; i++) {

			if (!flag) {
				this.HuddlesAndFolders.huddles.push({ is_fake: true });
			} else {
				this.HuddlesAndFolders.huddles = this.HuddlesAndFolders.huddles.filter((h) => {
					return !h.is_fake;
				});
			}


		}

	}

	public search() {

		this.initVars(true, true);

		this.LoadNextPage(this.params.folder_id, false);

	}

	private ReloadCurrentPage() {

		this.LoadNextPage(this.params.folder_id, false, true);

	}
	public LoadNextPage(folder_id?, scroll?, reload_current_page?) {


		if (!reload_current_page)
			this.Loadings.is_loading_huddles = true;

		let sessionData: any = this.headerService.getStaticHeaderData();

		let obj: any = {

			account_id: sessionData.user_current_account.accounts.account_id,
			user_id: sessionData.user_current_account.User.id,
			role_id: sessionData.user_current_account.roles.role_id,
			page: reload_current_page ? this.page <= 1 ? this.page : this.page - 1 : this.page,
			user_current_account: sessionData.user_current_account

		}

		obj.huddle_type = this.NVals(this.sessionService.GetItem("huddle_type"), ["0", "1", "2", "3"], "0");
		this.objHuddleType = obj.huddle_type;
		// if(obj.huddle_type=="3" && !this.Assessment_huddle_permissions()){
		//   obj.huddle_type="0";
		// }
		// obj.layout = this.NVals(this.sessionService.GetItem("huddle_layout"), ["0","1"], "0");
		obj.huddle_sort = this.NVals(this.sessionService.GetItem("huddle_sort"), ["0", "1", "2", "3"], "3");


		if (this.SearchString) {
			obj.title = this.SearchString;
		}

		if (folder_id) {
			obj.folder_id = folder_id;
		} else {
			obj.folder_id = "";
		}

		this.Loadings.isNextPageLoading = true;
		this.DealWithFakeHuddles(false);
		let ref = this.homeService.GetHuddles(obj).subscribe((data: any) => {
			this.showSkeleton = false;
			this.Loadings.is_loading_huddles = false;
			if (data.success) {
				if (!this.HuddlesAndFolders || !this.HuddlesAndFolders.huddles) {
					this.HuddlesAndFolders = data;
					this.ToggleFoldersExpand(true);
				} else {
					this.HuddlesAndFolders.huddles = this.HuddlesAndFolders.huddles.concat(data.huddles);
				}

				if (reload_current_page) {

					//In case you delete or move huddle/folder, uniq the items by ID
					this.HuddlesAndFolders.huddles = _.uniq(this.HuddlesAndFolders.huddles, true, h => h.huddle_id);
					this.HuddlesAndFolders.total_huddles = data.total_huddles;
				} else {

					this.page++;

				}

				this.PipeTrigger = !this.PipeTrigger;
				this.DealWithFakeHuddles(true);
				// window.scroll(0, this.Filters.layout==0? (scroll-1500): scroll-1000);
			} else {
				this.toastr.info(data.message);
			}
			setTimeout(() => {

				this.Loadings.isNextPageLoading = false;
				// if(scroll){
				//    window.scroll(0,document.body.offsetHeight-100);          
				// }

			}, 100);

			// BELOW LINES FOR TESTING API
			// this.HuddlesAndFolders.huddles = this.HuddlesAndFolders.huddles.slice(0,10);
			// this.HuddlesAndFolders.huddles.forEach((h,i)=>{

			// 	let arr = ["coaching", "collaboration", "assessment"];

			// 	h.type = arr[i];

			// });

			// let temp = JSON.parse(JSON.stringify(this.HuddlesAndFolders.huddles));

			// for(let i=0; i<50; i++){

			// 	this.HuddlesAndFolders.huddles = this.HuddlesAndFolders.huddles.concat(temp);

			// }


			ref.unsubscribe();
		});
	}

	public OnNameTextChange(e, mode) {

		if (e.keyCode == 13) {

			if (mode == "edit") {
				this.EditFolder();
			} else if (mode == "create") {
				this.CreateFolder();
			}

		}

	}

	public OnHuddleEdit(event) {
		let str = '';

		if (event.type === 'assessment')
			str = "/add_huddle_angular/assessment/edit/" + event.huddle_id;
		else
			str = "/add_huddle_angular/edit/" + event.huddle_id;

		this.fullRouter.navigate([str])

	}

	public CreateFolder() {

		if (!this.Inputs.NewFolderName || !this.Inputs.NewFolderName.trim()) {
			this.toastr.info(this.translation.huddle_please_provide_folder_name);
			return;
		}

		let sessionData: any = this.headerService.getStaticHeaderData();

		let obj: any = {
			folder_name: this.Inputs.NewFolderName,
			account_id: sessionData.user_current_account.accounts.account_id,
			user_id: sessionData.user_current_account.User.id
		}

		if (this.params.folder_id) {
			obj.folder_id = this.params.folder_id;
		}

		// console.log(this.Inputs.NewFolderName);
		this.HideModal("newFolderModal");
		this.homeService.CreateFolder(obj).subscribe((data: any) => {
			if (data.success) {
				// console.log(data);
				this.toastr.info(this.translation.huddle_folder_created_successfully);
				data.folder_object.title = data.folder_object.name;
				data.folder_object.folder_permissions = true;
				let currentSelectedSort = this.NVals(this.sessionService.GetItem("huddle_sort"), ["0", "1", "2", "3"], "3");
				if(currentSelectedSort == 3 || currentSelectedSort == 2){
					this.HuddlesAndFolders.folders.unshift(data.folder_object);
				} else {
					this.HuddlesAndFolders.folders.push(data.folder_object);
					this.sortFoldersByKey(currentSelectedSort);
				}

				this.PipeTrigger = !this.PipeTrigger;
				// this.Filters.layout = this.Filters.layout == 0 ? 1 : 0;
				// this.Filters.layout = this.Filters.layout == 0 ? 1 : 0;	
			} else {
				this.toastr.info(this.translation.something_went_wrong_msg);
			}


		});
	}

	public DigestFilters(key, value, force_block?) {

		this.sessionService.SetItem(key, value);
		if (key != "huddle_layout" && !force_block) {
			this.initVars(true, true);
			this.LoadNextPage(this.params.folder_id, false);
		}


	}

	public onDragged(item: any, list: any) {
		// ;
		// const index = list.indexOf( item );
		// list.splice( index, 1 );
	}


	public onDrop(event: DndDropEvent, target: any) {

		// ;

		// let index = event.index;

		// if( typeof index === "undefined" ) {

		//   index = list.length;
		// }
		if (this.Loadings.MovingItem) {
			// console.log(this.translation.huddle_already_moving);
			return;
		}
		// list.splice( index, 0, event.data );
		if (event.data.huddle_id && event.data.huddle_id >= 0) {

			this.Loadings.MovingItem = true;

			// let index = _.findIndex(this.HuddlesAndFolders.huddles, {huddle_id: event.data.huddle_id});

			let ref = this.homeService.Move({ folder_id: target.folder_id, huddle_id: event.data.huddle_id }).subscribe((data: any) => {
				this.Loadings.MovingItem = false;

				if (data.status) {
					target.stats[event.data.type]++;

					this.toastr.info(this.translation.huddle_moved_successfully);

					this.HuddlesAndFolders.huddles = this.HuddlesAndFolders.huddles.filter((huddle) => {

						return huddle.huddle_id != event.data.huddle_id;

					}); //this.HuddlesAndFolders.huddles.splice(index,1);    

					this.HuddlesAndFolders.total_huddles--;
				} else {
					this.toastr.info(data.message);
				}



				ref.unsubscribe();

			});





		} else if (event.data.folder_id && event.data.folder_id >= 0) {

			if (target.folder_id == event.data.folder_id) {
				return;
			}

			this.Loadings.MovingItem = true;
			let ref = this.homeService.Move({ folder_id: target.folder_id, huddle_id: event.data.folder_id }).subscribe((data: any) => {
				this.Loadings.MovingItem = false;
				if (data.success) {

					// target.stats[event.data.type]++;
					this.toastr.info(this.translation.huddle_folder_moved_successfully);
					target.stats.folders++;
					this.HuddlesAndFolders.folders = this.HuddlesAndFolders.folders.filter((f) => {

						return f.folder_id != event.data.folder_id;

					});
				} else {
					this.toastr.info(data.message);
				}



				ref.unsubscribe();

			});





		}

	}

	public getImgSrc(user) {

		return this.homeService.getAvatarPath(user);

	}

	public OnFolderClick(folder_id, tree) {
		// ;
		// tree.treeModel.getActiveNode().data
		// console.log(folder_id);

	}

	public getMovePath(tree) {

		if (!tree || !tree.treeModel || !tree.treeModel.getActiveNode() || !tree.treeModel.getActiveNode().data) {
			return;
		}
		//tree.treeModel.getActiveNode()
		let head = tree.treeModel.getActiveNode();

		if (tree.treeModel.getActiveNode().id == -1) return [tree.treeModel.getActiveNode().data];

		let arr = [];

		// let temp = JSON.parse(JSON.stringify(data));.data

		// console.log(this.deepFind(this.FoldersTreeData, {id: temp.parent}));

		while (head.parent != null) {

			if (head.data) {

				arr.push(head.data);

			}
			else if (head.treeModel.getActiveNode()) {

				arr.push(head.treeModel.getActiveNode().data);

			}

			head = head.parent;
		}

		if (arr.length == 0) return [tree.treeModel.getActiveNode().data];

		return arr.reverse();

	}



	public MoveItem(tree) {

		if (!tree.treeModel.getActiveNode()) {

			this.toastr.info(this.translation.huddle_no_traget_folder);

		}

		if (!(tree.treeModel.getActiveNode() && this.MovableItem.id)) return;

		// console.log(!!this.Loadings.MovingItem);
		if (this.Loadings.MovingItem) {
			//console.log("Already moving!");
			return;
		}

		let target = tree.treeModel.getActiveNode().data;

		let obj = {
			folder_id: target.id,
			huddle_id: this.MovableItem.id
		}

		if (this.MovableItem.isHuddle) {

			this.Loadings.MovingItem = true;
			this.homeService.Move(obj).subscribe((d: any) => {

				this.Loadings.MovingItem = false;
				if (d.success) {

					this.toastr.info(this.translation.huddle_moved_successfully);

					this.HuddlesAndFolders.huddles = this.HuddlesAndFolders.huddles.filter((h) => {

						return h.huddle_id != this.MovableItem.id;

					});

					this.HuddlesAndFolders.total_huddles--;

					let index = _.findIndex(this.HuddlesAndFolders.folders, { folder_id: target.id });

					if (index > -1) {

						this.HuddlesAndFolders.folders[index].stats[this.MovableItem.type]++;

					}

					this.ReloadCurrentPage();

				} else {
					this.toastr.info(d.message);
				}

			});



			this.HideModal("TreeViewDialog");

		} else {

			this.Loadings.MovingItem = true;
			this.homeService.Move(obj).subscribe((d: any) => {
				this.Loadings.MovingItem = false;
				if (d.success) {
					this.toastr.info(this.translation.huddle_folder_moved_successfully);
					this.HuddlesAndFolders.folders.forEach((f, i) => {
						if (f.folder_id == target.id) {

							f.stats[this.MovableItem.type]++;

						}
						if (f.folder_id == this.MovableItem.id) {
							this.HuddlesAndFolders.folders.splice(i, 1);
						}
					})
				} else {
					this.toastr.info(d.message);
				}

				this.PipeTrigger = !this.PipeTrigger;

			});



			this.HideModal("TreeViewDialog");

		}

		// console.log(this.MovableItem);
		// console.log(target);

	}

	public OnFolderMove(template: TemplateRef<any>, folder_id, isHuddle?, hType?) {

		if (!folder_id) return;

		this.MovableItem = {
			id: folder_id,
			isHuddle: Boolean(isHuddle),
			type: hType
		};

		let sessionData: any = this.headerService.getStaticHeaderData();

		let obj: any = {

			account_id: sessionData.user_current_account.accounts.account_id,
			user_id: sessionData.user_current_account.User.id,
			id: isHuddle ? "" : folder_id

		};

		let ref = this.homeService.GetFolderList(obj).subscribe((data) => {

			//console.log(data);
			this.FoldersTreeData = this.list_to_tree(data, 'parent');
			this.ModalRefs.TreeViewDialog = this.modalService.show(template);
			ref.unsubscribe();

		});


	}

	private list_to_tree(list, parentProp) {
		var map = {}, node, roots = [], i;
		for (i = 0; i < list.length; i += 1) {
			map[list[i].id] = i; // initialize the map
			list[i].children = []; // initialize the children
		}
		for (i = 0; i < list.length; i += 1) {
			node = list[i];
			node.name = node.text; //add name prop
			if (node[parentProp] !== "#") {
				// if you have dangling branches check that map[node[parentProp]] exists
				if (list[map[node[parentProp]]]) {
					list[map[node[parentProp]]].children.push(node);
				} else {
					// ;
				}

			} else {
				roots.push(node);
			}
		}
		return roots;
	}

	public ToggleFoldersExpand(flag) {
		this.foldersExpanded = flag;
		// this.HuddlesAndFolders.folders.forEach(f=>f.isExpanded=flag);
	}

	public ShowNewFolderModal(template: TemplateRef<any>) {

		this.Inputs.NewFolderName = "";
		this.ModalRefs.newFolderModal = this.modalService.show(template);

	}

	public ShowParticipentsModal(template: TemplateRef<any>, class_name) {

		this.ModalRefs.participentsModal = this.modalService.show(template, {
			class: class_name
		});

	}

	public OnHuddleParticipentsClick(huddle_id) {

		let huddle = _.findWhere(this.HuddlesAndFolders.huddles, { huddle_id: huddle_id });

		if (!huddle) {
			this.toastr.info(this.translation.something_went_wrong_msg);
			return;
		}

		// this.toastr.info(huddle.title);
		this.DetailedHuddle = huddle;
		this.ShowParticipentsModal(this.participentsDetailsModal, "lg_popup");
		if (huddle.type == "collaboration") {

			// console.log("collaboration type huddle selected");


		}


	}

	public HideModal(which) {

		if (which == 'newFolderModal') {
			this.ModalRefs.newFolderModal.hide();
			this.Inputs.NewFolderName = "";
		} else {

			this.ModalRefs[which].hide();
		}

	}


	public OnFolderEdit(folder_id, template: TemplateRef<any>) {

		let folder = _.findWhere(this.HuddlesAndFolders.folders, { folder_id: folder_id });

		if (folder && _.isObject(folder)) {
			if (template)
				this.EditableFolder = JSON.parse(JSON.stringify(folder));
			this.ModalRefs.RenameFolderModal = this.modalService.show(template);
		}

		// 

	}

	public OnFolderDelete(template: TemplateRef<any>, folder, isFolder?) {

		this.Inputs.Confirmation = "";
		this.DeletableItem = folder;
		this.DeletableItem.isFolder = isFolder;
		this.ModalRefs.confirmationDialog = this.modalService.show(template);

	}


	public ConfirmDelete() {
		// console.log(this.Inputs.Confirmation);
		;
		if (this.Inputs.ConfirmationKey != this.Inputs.Confirmation) {

			this.toastr.info(this.translation.huddle_you_typed_in + " '" + this.Inputs.ConfirmationKey + "' ");
			return;
		}

		let obj: any = {};

		let sessionData: any = this.headerService.getStaticHeaderData();
		obj.user_id = sessionData.user_current_account.User.id;

		if (this.DeletableItem.isFolder) {

			obj.folder_id = this.DeletableItem.folder_id;

			this.homeService.DeleteItem(obj, true).subscribe((data: any) => {

				this.HideModal("confirmationDialog");

				if (data.success) {
					this.toastr.info(data.message);
					this.HuddlesAndFolders.folders = this.HuddlesAndFolders.folders.filter((f) => {

						return this.DeletableItem.folder_id != f.folder_id;

					});
				} else {
					this.toastr.info(data.message);
				}

			});

		} else {
			obj.huddle_id = this.DeletableItem.huddle_id;
			this.homeService.DeleteItem(obj, false).subscribe((d: any) => {

				this.HideModal("confirmationDialog");

				if (d.success) {
					this.toastr.info(d.message);
					this.HuddlesAndFolders.huddles = this.HuddlesAndFolders.huddles.filter((h) => {

						return this.DeletableItem.huddle_id != h.huddle_id;

					});
					this.ReloadCurrentPage();
				} else {
					this.toastr.info(d.message);
				}

			});
		}
	}

	public EditFolder() {


		if (!this.EditableFolder.title.trim()) {
			this.toastr.info(this.translation.huddle_please_enter_folder_name);
			return;
		}
		if (this.EditableFolder && _.isObject(this.EditableFolder)) {
			this.HideModal('RenameFolderModal');
			// upon success

			let sessionData: any = this.headerService.getStaticHeaderData();

			let obj: any = {

				folder_id: this.EditableFolder.folder_id,
				account_id: sessionData.user_current_account.accounts.account_id,
				folder_name: this.EditableFolder.title,
				user_id: sessionData.user_current_account.User.id

			};

			if (this.params.folder_id) {
				obj.parent_account_folder_id = this.params.folder_id;
			}

			let ref = this.homeService.EditFolder(obj).subscribe((data: any) => {

				if (data.success) {
					this.toastr.info(data.message);

					_.each(this.HuddlesAndFolders.folders, (f) => {

						if (f.folder_id == this.EditableFolder.folder_id) {


							f.title = this.EditableFolder.title;
							f.last_edit_date = data.last_edit_date;
							this.EditableFolder = {};

							this.PipeTrigger = !this.PipeTrigger;
						}

					});
					
					let currentSelectedSort = this.NVals(this.sessionService.GetItem("huddle_sort"), ["0", "1", "2", "3"], "3");
					this.sortFoldersByKey(currentSelectedSort);

				} else {
					if (data.message)
						this.toastr.info(data.message);
					else
						this.toastr.info(this.translation.something_went_wrong_msg);
				}

			});



		}

	}

	get_add_huddle_link() {

		let folder_id = this.params.folder_id;

		let link = "/add_huddle_angular/home";

		if (typeof folder_id != 'undefined') {

			link += `?folderId=${folder_id}`;

		}

		return link;
	}



	public TriggerTextChange(ev) {

		if (ev.keyCode == 13) {
			this.ConfirmDelete()

		}
	}

	public Assessment_huddle_permissions() {
		//let data = {}; 
		let data: any = this.headerService.getStaticHeaderData();
		this.assessment_permissions = data.user_permissions.UserAccount.manage_evaluation_huddles == 1;
		return this.assessment_permissions;
	}

	private sortFoldersByKey(key: number) {
		if (key == 3 || key == 1 || key == 0) {
			this.HuddlesAndFolders.folders.sort((firstIndex, secondIndex) => {
				if (key == 3) {
					let fIndexDate: any = new Date(firstIndex['last_edit_date']);
					let sIndexDate: any = new Date(secondIndex['last_edit_date']);
					return sIndexDate - fIndexDate;
				} else if (key == 1) {
					let firstIndexCreatedByName = firstIndex['created_by_name'].toLowerCase();
					let secondIndexCreatedByName = secondIndex['created_by_name'].toLowerCase();
					if (firstIndexCreatedByName < secondIndexCreatedByName) return -1;
					if (firstIndexCreatedByName > secondIndexCreatedByName) return 1;
					return 0;
				} else if (key == 0) {
					let firstIndexTitle = firstIndex['title'].toLowerCase();
					let secondIndexTitle = secondIndex['title'].toLowerCase();
					if (firstIndexTitle < secondIndexTitle) return -1;
					if (firstIndexTitle > secondIndexTitle) return 1;
					return 0;
				}
			});
		}
	}


	ngOnDestroy() {

		// for(let k in this.subscriptionRefs){

		// 	if(this.subscriptionRefs[k] && typeof(this.subscriptionRefs[k].unsubscribe)=='function'){
		// 		this.subscriptionRefs[k].unsubscribe();
		// 	}

		// }
		// this.subscriptionRefs
		//.unsubscribe();

		this.subscription.unsubscribe();
		if (this.ModalRefs && this.ModalRefs.TreeViewDialog) this.ModalRefs.TreeViewDialog.hide();
		if (this.ModalRefs && this.ModalRefs.newFolderModal) this.ModalRefs.newFolderModal.hide();
		if (this.ModalRefs && this.ModalRefs.participentsModal) this.ModalRefs.participentsModal.hide();
		if (this.ModalRefs && this.ModalRefs.RenameFolderModal) this.ModalRefs.RenameFolderModal.hide();
		if (this.ModalRefs && this.ModalRefs.confirmationDialog) this.ModalRefs.confirmationDialog.hide();

	}



}

interface filters {
	[key: string]: any
}

interface Modals {
	[key: string]: any
}

interface GeneralInputs {
	NewFolderName: string,
	Confirmation: string,
	ConfirmationKey: string
}

interface params {
	folder_id?: string,
	account_id: string,
	user_id: string,
	role_id: string,
	page: string,
	user_current_account: string
}